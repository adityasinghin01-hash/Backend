const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Auth App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `<h2>Verify Your Email</h2><p>Click below to verify your account:</p><a href="${verificationUrl}">Verify Email</a><p>This link expires in 15 minutes.</p>`
  });
  console.log('✅ Verification email sent to:', email);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `myapp://reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Auth App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your password',
    html: `<h2>Reset Password</h2><p>Click below to reset your password:</p><a href="${resetUrl}">Reset Password</a><p>Expires in 15 minutes.</p>`
  });
  console.log('✅ Reset email sent to:', email);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
