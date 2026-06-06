const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const baseTemplate = ({ title, body }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <h2>${escapeHtml(title)}</h2>
    ${body}
    <p style="margin-top: 24px; color: #64748b;">AapkaDhyan Healthcare</p>
  </div>
`;

const verificationEmail = ({ fullName, verifyUrl }) => ({
  subject: "Verify your AapkaDhyan email",
  html: baseTemplate({
    title: "Email Verification",
    body: `
      <p>Hello ${escapeHtml(fullName)},</p>
      <p>Please verify your email address to activate your healthcare account.</p>
      <p><a href="${escapeHtml(verifyUrl)}">Verify Email</a></p>
    `,
  }),
});

const welcomeEmail = ({ fullName }) => ({
  subject: "Welcome to AapkaDhyan",
  html: baseTemplate({
    title: "Welcome to AapkaDhyan",
    body: `
      <p>Hello ${escapeHtml(fullName)},</p>
      <p>Your email has been verified successfully. You can now continue with your healthcare dashboard access.</p>
    `,
  }),
});

const resetPasswordEmail = ({ fullName, resetUrl }) => ({
  subject: "Reset your AapkaDhyan password",
  html: baseTemplate({
    title: "Password Reset",
    body: `
      <p>Hello ${escapeHtml(fullName)},</p>
      <p>Use the link below to reset your password. This link expires soon.</p>
      <p><a href="${escapeHtml(resetUrl)}">Reset Password</a></p>
    `,
  }),
});

module.exports = {
  verificationEmail,
  welcomeEmail,
  resetPasswordEmail,
};
