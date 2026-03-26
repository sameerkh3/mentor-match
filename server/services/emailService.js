import nodemailer from 'nodemailer';

// Transporter is created once and reused across all email calls
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Notify a mentor that a mentee has sent them a new request.
 * Fire-and-forget — caller should not await this.
 *
 * @param {Object} mentor  - { name, email }
 * @param {Object} mentee  - { name }
 * @param {Object} request - { goal, message }
 */
export async function sendNewRequestEmail(mentor, mentee, request) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: mentor.email,
      subject: `New Mentorship Request from ${mentee.name}`,
      html: `
        <p>Hi ${mentor.name},</p>
        <p><strong>${mentee.name}</strong> has sent you a mentorship request.</p>
        <p><strong>Goal:</strong> ${request.goal}</p>
        <p><strong>Message:</strong> ${request.message}</p>
        <p><a href="${CLIENT_URL}/mentor/dashboard">View in your dashboard →</a></p>
      `,
    });
  } catch (err) {
    // Email failure must never crash the request handler
    console.error('sendNewRequestEmail error:', err.message);
  }
}

/**
 * Notify a mentee that their request status has been updated.
 * Fire-and-forget — caller should not await this.
 *
 * @param {Object} mentee - { name, email }
 * @param {Object} mentor - { name }
 * @param {string} status - 'accepted' | 'declined'
 */
export async function sendStatusUpdateEmail(mentee, mentor, status) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: mentee.email,
      subject: `Your mentorship request was ${status}`,
      html: `
        <p>Hi ${mentee.name},</p>
        <p>Your mentorship request to <strong>${mentor.name}</strong> has been <strong>${status}</strong>.</p>
        <p><a href="${CLIENT_URL}/dashboard">View your dashboard →</a></p>
      `,
    });
  } catch (err) {
    console.error('sendStatusUpdateEmail error:', err.message);
  }
}
