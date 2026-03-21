const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your email',
    html: `<h2>Verify Your Email</h2><p>Click below:</p><a href="${verificationUrl}">Verify Email</a><p>Expires in 15 minutes.</p>`
  });
  if (error) { console.error('❌ Resend error:', error); throw error; }
  console.log('✅ Verification email sent to:', email);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `myapp://reset-password?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your password',
    html: `<h2>Reset Password</h2><p>Click below:</p><a href="${resetUrl}">Reset Password</a><p>Expires in 15 minutes.</p>`
  });
  if (error) { console.error('❌ Resend error:', error); throw error; }
  console.log('✅ Reset email sent to:', email);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
