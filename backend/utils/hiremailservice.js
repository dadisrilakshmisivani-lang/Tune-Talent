const nodemailer = require('nodemailer');
const path = require('path');
const dns = require('dns');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const sendHireMail = async (email, username, subject, htmlBody) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465 ,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    name: 'localhost',
    lookup(hostname, options, callback) {
      dns.lookup(hostname, { family: 4 }, callback);
    }
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
