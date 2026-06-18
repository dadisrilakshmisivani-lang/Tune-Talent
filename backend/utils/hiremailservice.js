const { Resend } = require('resend');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const resend = new Resend(process.env.RESEND_API_KEY);

const sendHireMail = async (email, username, subject, htmlBody) => {
  try {
    const data = await resend.emails.send({
      from: 'TuneTalent <onboarding@resend.dev>',
      to: [email],
      subject: subject || `TuneTalent - Hire Inquiry`,
      html: htmlBody,
    });
    console.log("Hire email sent via Resend:", data);
  } catch (err) {
    console.error("Error while sending hire email via Resend:", err);
  }
};

module.exports = sendHireMail;
