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
  const url = `${process.env.BASE_URL}/api/verify-email?token=${token}`;
  await sendEmail(email, 'Verify your email',
    `<h2>Verify Your Email</h2><p>Click below:</p><a href="${url}">Verify Email</a><p>Expires in 15 minutes.</p>`
  );
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `myapp://reset-password?token=${token}`;
  await sendEmail(email, 'Reset your password',
    `<h2>Reset Password</h2><p>Click below:</p><a href="${url}">Reset Password</a><p>Expires in 15 minutes.</p>`
  );
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
