const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  unsubscribed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
