const paypal = require("paypal-rest-sdk");
const logger = require("../utils/logger");

const connectPaypal = async () => {
  try {
    paypal.configure({
      mode: "sandbox", //sandbox or live
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });
    console.log("Paypal Connected...");
  } catch (err) {
    await logger(req, "Error", err);
    console.error(err);
  }
};

module.exports = connectPaypal;
