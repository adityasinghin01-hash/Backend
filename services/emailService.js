const sendEmail = async (to, subject, html) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Auth App', email: 'aditya.singh.in01@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    console.error('❌ Brevo error:', err);
    throw new Error(err.message || 'Email send failed');
  }
  console.log('✅ Email sent to:', to);
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${token}`;
  
  const verificationEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;">Verify Your Email</h1>
          <p style="color:rgba(255,255,255,0.85);margin:10px 0 0;font-size:16px;">One step away from getting started</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#333;font-size:16px;line-height:1.6;">Hi there 👋</p>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:20px 0 30px;">Thanks for signing up! Please verify your email address. This link expires in <strong>15 minutes</strong>.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${verificationUrl}" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">✉️ Verify My Email</a>
          </div>
          <p style="color:#888;font-size:13px;text-align:center;">If you didn't create an account, ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f8f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:12px;margin:0;">© 2025 Auth App. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail(email, 'Action Required: Verify Your TestApp Account', verificationEmailHtml);
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.BASE_URL}/api/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; color: #333;">
      <h2 style="color: #1A1A2E; margin-bottom: 24px; font-size: 28px;">Reset Your Password</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px; color: #555;">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <a href="${url}" style="display: inline-block; background-color: #6C63FF; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 32px;">
        Reset Password
      </a>
      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        This link will expire in 15 minutes.<br>
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  await sendEmail(email, 'Action Required: Reset Your Password', html);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
