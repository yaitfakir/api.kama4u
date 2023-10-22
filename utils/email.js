const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// const logger = require("../utils/logger");

const sendEmail = async (email, subject, email_config) => {
  try {
    let data = fs.readFileSync(
      path.resolve(__dirname, "../email_templates/basic_template.html")
    );
    html = data.toString().replace("{URL}", email_config.link);
    html = html.toString().replace("{TITLE}", email_config.title);
    html = html.toString().replace("{HEADER}", email_config.header);
    html = html.toString().replace("{ACTION}", email_config.action);

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
      html: html,
    });

    console.log("email sent sucessfully");
  } catch (err) {
    // await logger("", "Error", err);

    console.log("email not sent,", err);
  }
};

module.exports = sendEmail;
