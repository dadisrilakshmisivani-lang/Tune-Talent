const nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const sendHireMail = async (email, username, subject, htmlBody) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const msg = {
    from: `"Sonu" ${process.env.SMTP_USER}`,
    to: email,
    subject: subject || `TuneTalent - Hire Inquiry`,
    text: "New Hire Inquiry on TuneTalent",
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log("Hire email sent:", info.messageId);
  } catch (err) {
    console.error("Error while sending hire email:", err);
  }
};

module.exports = sendHireMail;
