const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP is not provided, we just log to console
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('\n=============================================');
    console.log(`[Development Mode] Email to: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log(`HTML: ${options.html}`);
    console.log('=============================================\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'FitForge AI'} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
