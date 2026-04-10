import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { User } from '../models/User.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { sendOTP } from '../../common/utils/mailer.js';
import { verifyPassword } from '../../common/utils/password.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const enable2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.is2FAEnabled) throw new ApiError(400, '2FA is already enabled');

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await user.save();

    await sendOTP(user.email, otp);

    res.json({ success: true, message: 'OTP sent to email. Verify to enable 2FA.' });
});

export const verifyEnable2FA = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    if (!otp) throw new ApiError(400, 'OTP is required');

    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.otp || user.otpExpires < new Date() || user.otp !== otp) {
        throw new ApiError(401, 'Invalid or expired OTP');
    }

    user.is2FAEnabled = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: '2FA enabled successfully' });
});

export const disable2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    
    const { password } = req.body;
    if (!password) throw new ApiError(400, 'Password is required to disable 2FA');
    
    // Fallback: If standard users don't have password setup via social login etc., you'd change this flow.
    // Assuming standard login scheme for Stay & Go.
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid password');

    user.is2FAEnabled = false;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: '2FA disabled successfully' });
});
