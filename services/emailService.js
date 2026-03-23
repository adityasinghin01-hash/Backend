// services/emailService.js

const { BREVO_API_KEY, BASE_URL } = require('../config/config');

const layout = (bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AuthApp</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;">
          <tr>
            <td style="background:#111111;padding:28px 40px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px;">AuthApp</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.6;">
                This email was sent by AuthApp. If you didn't request this, you can safely ignore it.<br/>Do not share this email or its contents with anyone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const button = (href, label) => `
  <table cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
    <tr>
      <td style="background:#111111;border-radius:6px;">
        <a href="${href}"
           style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;
                  font-weight:600;text-decoration:none;letter-spacing:0.3px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

const otpBox = (otp) => `
  <div style="margin:32px 0;text-align:center;">
    <div style="display:inline-block;background:#f7f7f7;border:1px solid #e0e0e0;
                border-radius:8px;padding:20px 40px;">
      <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#111111;
                   font-family:'Courier New',Courier,monospace;">
        ${otp}
      </span>
    </div>
    <p style="margin:12px 0 0;font-size:13px;color:#999999;">
      This code expires in <strong style="color:#111111;">15 minutes</strong>
    </p>
  </div>
`;

const divider = `<hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;" />`;

async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'AuthApp', email: 'aditya.singh.in01@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo send failed [${res.status}]: ${err}`);
  }
}

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${BASE_URL}/api/verify-email?token=${token}`;
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">Verify your email</h2>
    <p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">
      Thanks for signing up. Click the button below to confirm your email address and activate your account.
    </p>
    ${button(verifyUrl, 'Verify Email →')}
    ${divider}
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
      This link expires in <strong style="color:#111111;">24 hours</strong>. If you didn't create an account, no action is needed.
    </p>
  `);
  await sendEmail({ to: email, subject: 'Verify your AuthApp account', html });
}

async function sendOtpEmail(email, otp) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">Password reset code</h2>
    <p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">
      Use the code below to reset your password. Enter it on the verification screen.
    </p>
    ${otpBox(otp)}
    ${divider}
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    </p>
  `);
  await sendEmail({ to: email, subject: 'Your AuthApp reset code', html });
}

async function sendPasswordResetEmail(email) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">Password changed</h2>
    <p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">
      Your AuthApp password was successfully updated. You can now log in with your new password.
    </p>
    ${divider}
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
      If you didn't make this change, please contact support immediately or reset your password again to secure your account.
    </p>
  `);
  await sendEmail({ to: email, subject: 'Your password has been changed', html });
}

module.exports = { sendVerificationEmail, sendOtpEmail, sendPasswordResetEmail };
