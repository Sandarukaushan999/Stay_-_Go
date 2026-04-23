import { Router } from 'express'
import passport from 'passport'
import { OAuth2Client } from 'google-auth-library'
import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { signAccessToken } from '../../common/utils/jwt.js'
import { sanitizeUser } from '../auth/auth.service.js'
import { env } from '../../config/env.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { User } from '../users/user.model.js'

export const googleAuthRouter = Router()

const CLIENT_URL = env.CLIENT_URL || 'http://localhost:5173'

// Google OAuth2 client for ID-token verification
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

// ─────────────────────────────────────────────────────────────────────────────
// Helper: verify Google ID token and return clean payload
// ─────────────────────────────────────────────────────────────────────────────
async function verifyGoogleIdToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  return {
    sub: payload.sub,                          // Google's unique user ID (provider_id)
    email: (payload.email || '').toLowerCase(),
    name: payload.name || '',
    picture: payload.picture || null,
    emailVerified: Boolean(payload.email_verified),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: attach live user from Bearer JWT (used by Passport linking flow)
// ─────────────────────────────────────────────────────────────────────────────
async function attachLiveUser(req, _res, next) {
  try {
    // Read from Authorization header first, then fall back to query param
    // (browser redirects cannot set headers, so profile-page linking sends token as ?token=...)
    const header = req.headers.authorization
    const queryToken = req.query.token
    const raw = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : queryToken

    if (raw) {
      const { verifyAccessToken } = await import('../../common/utils/jwt.js')
      const decoded = verifyAccessToken(raw)
      if (decoded?.sub) {
        const user = await User.findById(decoded.sub)
        if (user && !user.isBlocked) {
          req.liveUser = user
          req.liveToken = raw   // keep token so we can encode it into OAuth state
        }
      }
    }
  } catch {
    // ignore — not logged in, treat as fresh OAuth
  }
  next()
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/google/signin
// Primary sign-in endpoint: frontend sends Google ID token, we verify it
// server-side and return one of three actions:
//   • logged_in      → already linked, return JWT immediately
//   • link_required  → email exists but no googleId, ask user to confirm link
//   • onboard        → brand new email, redirect to registration with pre-filled data
// ─────────────────────────────────────────────────────────────────────────────
googleAuthRouter.post(
  '/google/signin',
  asyncHandler(async (req, res) => {
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' })
    }

    // 1. Verify token server-side — never trust frontend data
    let googleData
    try {
      googleData = await verifyGoogleIdToken(idToken)
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token' })
    }

    const { sub: providerId, email, name, picture } = googleData

    // 2a. User exists with this Google sub → log in directly
    let user = await User.findOne({ googleId: providerId })
    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Account is blocked. Contact support.' })
      }
      // Refresh stored Google profile data
      user.googleEmail   = email
      user.googleName    = name
      user.googlePicture = picture
      user.lastLogin     = new Date()
      await user.save()

      const token = signAccessToken({ sub: user._id.toString(), role: user.role })
      return res.json({
        success: true,
        action: 'logged_in',
        token,
        user: sanitizeUser(user),
      })
    }

    // 2b. No googleId match — check by email
    if (email) {
      const emailUser = await User.findOne({ email })
      if (emailUser) {
        if (emailUser.isBlocked) {
          return res.status(403).json({ success: false, message: 'Account is blocked. Contact support.' })
        }

        if (!emailUser.googleId) {
          // Email exists but Google NOT linked → prompt user to link
          return res.json({
            success: true,
            action: 'link_required',
            message: `A Stay & Go account with ${email} already exists. Would you like to link your Google account?`,
            email,
            // Pass back the idToken so the confirm-link endpoint can re-verify it
            // (frontend stores it temporarily; never store idTokens in DB)
          })
        }

        // Safety: email user already has a DIFFERENT googleId — reject duplicate link
        return res.status(409).json({
          success: false,
          message: 'This email is already linked to a different Google account.',
        })
      }
    }

    // 2c. No match at all → new user, send to onboarding
    return res.json({
      success: true,
      action: 'onboard',
      message: 'No account found. Please complete registration.',
      googleData: {
        email,
        name,
        picture,
        provider: 'google',
        providerId,
      },
    })
  })
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/google/confirm-link
// Called after user confirms they want to link Google to their existing account.
// Re-verifies the idToken (never trust cached/frontend data) and attaches googleId.
// ─────────────────────────────────────────────────────────────────────────────
googleAuthRouter.post(
  '/google/confirm-link',
  asyncHandler(async (req, res) => {
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' })
    }

    // Re-verify the token server-side
    let googleData
    try {
      googleData = await verifyGoogleIdToken(idToken)
    } catch {
      return res.status(401).json({ success: false, message: 'Google token could not be verified. Please try again.' })
    }

    const { sub: providerId, email, name, picture } = googleData

    // Safety check: ensure no one else already claimed this googleId
    const alreadyClaimed = await User.findOne({ googleId: providerId })
    if (alreadyClaimed) {
      return res.status(409).json({
        success: false,
        message: 'This Google account is already linked to another Stay & Go account.',
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please register first.',
        action: 'onboard',
      })
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account is blocked. Contact support.' })
    }

    // Attach Google to the existing user
    user.googleId      = providerId
    user.googleEmail   = email
    user.googleName    = name
    user.googlePicture = picture
    user.lastLogin     = new Date()
    await user.save()

    const token = signAccessToken({ sub: user._id.toString(), role: user.role })
    return res.json({
      success: true,
      action: 'linked',
      message: 'Google account linked successfully. You are now logged in.',
      token,
      user: sanitizeUser(user),
    })
  })
)

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING PASSPORT OAUTH2 REDIRECT FLOW (kept for profile-page linking)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /auth/google
 * Initiates the Google OAuth flow (used from profile page to link while logged in).
 */
googleAuthRouter.get(
  '/google',
  attachLiveUser,
  (req, res, next) => {
    // Encode userId into state using base64url (URL-safe: no +/=/chars that break query strings)
    let state = ''
    if (req.liveUser) {
      const payload = JSON.stringify({ uid: req.liveUser._id.toString() })
      state = Buffer.from(payload).toString('base64url')
    }
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state,
    })(req, res, next)
  }
)

/**
 * GET /auth/google/callback
 * Google redirects back here after user consents.
 */
googleAuthRouter.get(
  '/google/callback',
  async (req, _res, next) => {
    // Decode state to rehydrate liveUser — uses base64url to survive URL transport
    try {
      const state = req.query.state
      if (state) {
        let uid = ''
        try {
          // base64url format: JSON { uid }
          const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
          uid = parsed.uid || ''
        } catch {
          // Fallback: plain base64 (legacy)
          try { uid = Buffer.from(state, 'base64').toString('utf8') } catch { /* ignore */ }
        }
        if (uid && uid.match(/^[a-f\d]{24}$/i)) {   // basic ObjectId sanity check
          const user = await User.findById(uid)
          if (user && !user.isBlocked) req.liveUser = user
        }
      }
    } catch { /* ignore */ }
    next()
  },
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${CLIENT_URL}/auth/google/success?google=error`,
  }),
  asyncHandler(async (req, res) => {
    const user = req.user
    const token = signAccessToken({ sub: user._id.toString(), role: user.role })

    // Send token as HTTP-only cookie AND redirect to frontend
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Pass token in URL so the SPA can store it in localStorage
    res.redirect(`${CLIENT_URL}/auth/google/success?token=${token}`)
  })
)

/**
 * DELETE /auth/google/disconnect
 * Removes the linked Google account from the user's profile.
 */
googleAuthRouter.delete(
  '/google/disconnect',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    // Check if the user can still log in without Google (must have a real password)
    if (!user.googleId) {
      return res.status(400).json({ success: false, message: 'No Google account linked.' })
    }
    if (user.passwordHash === 'GOOGLE_OAUTH_NO_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: 'You signed up with Google only. Set a password before disconnecting.',
      })
    }

    user.googleId      = undefined
    user.googleEmail   = undefined
    user.googleName    = undefined
    user.googlePicture = undefined
    await user.save()
    res.json({ success: true, message: 'Google account disconnected successfully.' })
  })
)

/**
 * GET /auth/logout  — destroy local JWT/cookie only, does NOT log out from Google
 */
googleAuthRouter.get('/logout', (req, res) => {
  res.clearCookie('access_token')
  res.json({ success: true, message: 'Logged out successfully' })
})
