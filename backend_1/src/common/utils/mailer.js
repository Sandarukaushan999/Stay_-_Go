import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendOTP = async (email, otp) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`\n===========================================`);
            console.log(`[MOCK EMAIL SMTP] To: ${email}`);
            console.log(`2FA OTP Code: ${otp}`);
            console.log(`===========================================\n`);
            return true;
        }

        await transporter.sendMail({
            from: `"Stay & Go Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your 2FA Verification Code',
            text: `Your security code is: ${otp}. It will expire in 5 minutes.`,
            html: `<b>Your security code is: <h2>${otp}</h2></b><br/>It will expire in 5 minutes.`
        });
        return true;
    } catch (err) {
        console.error('Failed to send OTP email:', err);
        return false;
    }
};
