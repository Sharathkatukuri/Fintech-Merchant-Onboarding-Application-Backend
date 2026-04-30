const nodemailer = require("nodemailer");

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendApplicationStatusEmail = async ({
  to,
  ownerName,
  businessName,
  status,
  reviewNotes,
}) => {
  const transporter = createTransporter();

  const subject = `Viyona application ${status.toLowerCase()}`;
  const text = [
    `Hello ${ownerName || "Merchant"},`,
    "",
    `Your application for ${businessName} has been ${status.toLowerCase()}.`,
    reviewNotes ? `Remarks: ${reviewNotes}` : null,
    "",
    "Thank you,",
    "Viyona Team",
  ]
    .filter(Boolean)
    .join("\n");

  if (!transporter) {
    console.log(`Email notification skipped for ${to}: ${subject}`);
    return { delivered: false, skipped: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });

  return { delivered: true, skipped: false };
};

module.exports = {
  sendApplicationStatusEmail,
};
