const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const Sub = require("../utils/subscription");

router.get("/", async (req, res) => {
  try {
    return res.status(200).json({ message: "kamas4u works" });
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/contact-us", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    var messageBuilder = "";
    messageBuilder =
      `Name : ${name} \n ` +
      `Email : ${email} \n ` +
      `Subject : ${subject} \n ` +
      `Message : ${message} \n `;
    await mailer("kama4u@gmail.com", "Contact-us | Seller", messageBuilder);
    return res.status(200).json({ message: messageBuilder });
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      await Sub.subscribe(email, process.env.STANDARD);
    }

    return res.status(200).json();
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      await Sub.unsubscribe(email);
    }

    return res.status(200).json();
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;
