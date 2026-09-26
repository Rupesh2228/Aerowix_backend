import nodemailer from 'nodemailer';

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function notifyNewInquiry(subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.log('[mailer] SMTP not configured, skipping email notification.');
    return;
  }
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aerowix Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('[mailer] Failed to send notification email:', err);
  }
}
