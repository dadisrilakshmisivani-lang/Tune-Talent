const { Resend } = require('resend');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBidMail = async (email, username, subject, htmlBody) => {
  try {
    const data = await resend.emails.send({
      from: 'TuneTalent <onboarding@resend.dev>',
      to: [email],
      subject: subject || `${username} - New Bid Placed`,
      html: htmlBody,
    });
    console.log("Bid email sent via Resend:", data);
  } catch (err) {
    console.error("Error while sending bid email via Resend:", err);
  }
};

module.exports = sendBidMail;
