const emailjs = require('@emailjs/nodejs');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const mail = async (email, username) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        to_name: username,
        subject: `${username} Account Creation`,
        message: 'Your email has been registered successfully.'
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    console.log("Registration email sent:", response.status, response.text);
  } catch (err) {
    console.error("Error while sending registration email:", err);
  }
};

module.exports = mail;