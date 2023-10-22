const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, unique: true },
  phone: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false },
  role: { type: String }, // admin - standard
});

module.exports = mongoose.model("User", userSchema);
