const logger = require("../utils/logger");
const Subscription = require("../models/Subscription");

const subscribe = async (email, profile) => {
  try {
    if (!email) {
      throw new Error("Email Adresse is required");
    }
    // Check if the email exists first of all
    const oldUser = await Subscription.findOne({ email });

    if (oldUser) {
      await Subscription.findOneAndUpdate(
        {
          email: email,
        },
        { unsubscribed: false }
      );
    } else {
      await Subscription.create({
        email: email,
        profile: profile,
      });
    }
  } catch (err) {
    await logger("Subscribe email " + email, "Error", err);

    console.error(err);
    throw new Error("Server error.");
  }
};

const unsubscribe = async (email) => {
  try {
    if (!email) {
      throw new Error("Email Adresse is required");
    }

    await Subscription.findOneAndUpdate(
      {
        email: email,
      },
      { unsubscribed: true }
    );
  } catch (err) {
    await logger("Unsubscribe email " + email, "Error", err);

    console.error(err);
    throw new Error("Server error.");
  }
};

module.exports = { subscribe, unsubscribe };
