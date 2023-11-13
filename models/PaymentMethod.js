const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema({
  name: { type: String },
  addPrice: { type: Number },
  percentage: { type: Number },
  etat: { type: Boolean },
});

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);
