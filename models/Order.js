const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  server: { type: String },
  characterName: { type: String },
  paymentMethod: { type: String },
  paymentInfo: { type: String },
  quantity: { type: Number },
  fullName: { type: String },
  codeForExchange: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String },
  actions: [
    {
      createdAt: { type: Date, default: Date.now },
      action: String,
      motif: String,
    },
  ],
  owner: { type: mongoose.Types.ObjectId, ref: "User" },
  type: { type: String }, //Sell, Buy, Exchange
  currency: { type: String },
  totalToBePaid: { type: Number },
  rate: { type: Number },
});

module.exports = mongoose.model("Order", orderSchema);
