const nodemailer = require("nodemailer");
// const logger = require("../utils/logger");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.SECURE,
      auth: {
        user: process.env.USER_NAME,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: "Kama4u " + process.env.USER_NAME,
      to: email,
      subject: subject,
      text: text,
    });

    // console.log("email sent sucessfully");
  } catch (err) {
    // await logger("", "Error", err);

    console.log("email not sent,", err);
  }
};

module.exports = sendEmail;
