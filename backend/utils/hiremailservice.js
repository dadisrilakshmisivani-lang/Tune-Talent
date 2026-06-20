const emailjs = require('@emailjs/nodejs');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const sendHireMail = async (email, username, subject, htmlBody) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        to_name: username,
        subject: subject || `TuneTalent - Hire Inquiry`,
        message: htmlBody
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    console.log("Hire email sent:", response.status, response.text);
  } catch (err) {
    console.error("Error while sending hire email:", err);
  }
};

module.exports = sendHireMail;
