const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${token}`;
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.sender = { email: process.env.SMTP_USER, name: 'Auth App' };
  sendSmtpEmail.subject = 'Verify your email';
  sendSmtpEmail.htmlContent = `<h2>Verify Your Email</h2><p>Click below:</p><a href="${verificationUrl}">Verify Email</a><p>Expires in 15 minutes.</p>`;
  await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log('✅ Verification email sent to:', email);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `myapp://reset-password?token=${token}`;
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.sender = { email: process.env.SMTP_USER, name: 'Auth App' };
  sendSmtpEmail.subject = 'Reset your password';
  sendSmtpEmail.htmlContent = `<h2>Reset Password</h2><p>Click below:</p><a href="${resetUrl}">Reset Password</a><p>Expires in 15 minutes.</p>`;
  await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log('✅ Reset email sent to:', email);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
