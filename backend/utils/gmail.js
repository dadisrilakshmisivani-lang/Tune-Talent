const nodemailer = require('nodemailer');
const path = require('path');
const dns = require('dns');

// Force Node to use IPv4 instead of IPv6 to prevent ENETUNREACH errors on certain networks
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const body = `
<h2>User Registered Successfully</h2>
<p>Your email has been registered successfully.</p>
`;

const mail = async (email, username) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const msg = {
    from: `"Sonu" ${process.env.SMTP_USER}`,
    to: email,
    subject: `${username} Account Creation`,
    text: "Hello World",
    html: body,
  };

  try {
    const info = await transporter.sendMail(msg);

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};

module.exports = mail;