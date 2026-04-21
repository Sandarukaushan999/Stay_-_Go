import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from '../../config/env.js'
import { User } from '../users/user.model.js'

export function configureGoogleStrategy() {
  console.log('✅ Google Strategy init with callbackURL:', env.GOOGLE_CALLBACK_URL)

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, _accessToken, _refreshToken, profile, done) => {
        try {
          const googleId   = profile.id
          const email      = (profile.emails?.[0]?.value || '').toLowerCase()
          const avatar     = profile.photos?.[0]?.value || null
          const displayName = profile.displayName || ''

          // If a JWT user is already logged in → link Google to existing account
          if (req.liveUser) {
            const existing = req.liveUser
            if (existing.googleId && existing.googleId !== googleId) {
              return done(null, false, { message: 'Another Google account is already linked.' })
            }
            existing.googleId      = googleId
            existing.googleEmail   = email
            existing.googleName    = displayName
            existing.googlePicture = avatar
            if (!existing.profileImage && avatar) existing.profileImage = avatar
            await existing.save()
            return done(null, existing)
          }

          // Look for user by googleId first, then email
          let user = await User.findOne({ googleId })
          if (!user && email) {
            user = await User.findOne({ email })
          }

          if (user) {
            // Link Google ID if not set yet, always refresh Google profile data
            if (!user.googleId) user.googleId = googleId
            user.googleEmail   = email
            user.googleName    = displayName
            user.googlePicture = avatar
            if (!user.profileImage && avatar) user.profileImage = avatar
            user.lastLogin = new Date()
            await user.save()
            return done(null, user)
          }

          // Create brand-new user from Google profile
          if (!email) return done(null, false, { message: 'Google account has no email.' })

          const newUser = await User.create({
            fullName:      displayName,
            email,
            passwordHash:  'GOOGLE_OAUTH_NO_PASSWORD',
            googleId,
            googleEmail:   email,
            googleName:    displayName,
            googlePicture: avatar,
            profileImage:  avatar,
            isVerified:    true,
            lastLogin:     new Date(),
          })
          return done(null, newUser)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
}
