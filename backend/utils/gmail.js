const { Resend } = require('resend');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const resend = new Resend(process.env.RESEND_API_KEY);

const body = `
<h2>User Registered Successfully</h2>
<p>Your account has been created successfully.</p>
`;

const mail = async (email, username) => {
  try {
    const data = await resend.emails.send({
      from: 'TuneTalent <onboarding@resend.dev>',
      to: [email],
      subject: `${username} Account Creation`,
      html: body,
    });
    console.log("Registration email sent via Resend:", data);
  } catch (err) {
    console.error("Error while sending registration mail via Resend:", err);
  }
};

module.exports = mail;