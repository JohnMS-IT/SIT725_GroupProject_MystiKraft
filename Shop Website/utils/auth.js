const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate and send verification email
exports.sendVerificationEmail = (user, req) => {
  // Ensure the verification token exists
  if (!user.emailVerificationToken) {
    throw new Error('No verification token found for user');
  }
  
  const verificationUrl = `http://${req.headers.host}/api/auth/verify/${user.emailVerificationToken}`;
  
  const mailOptions = {
    to: user.email,
    subject: 'Verify Your Email for MystiKraft',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to MystiKraft!</h2>
        <p>Thank you for registering with MystiKraft, your ultimate sneaker destination.</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #ff6b00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>If you did not create an account with MystiKraft, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">This is an automated message from MystiKraft. Please do not reply to this email.</p>
      </div>
    `
  };
  
  // Send the verification email
  return transporter.sendMail(mailOptions);
};