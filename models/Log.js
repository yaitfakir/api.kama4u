const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  type: { type: String },
  error: { type: Object },
  headers: { type: Object },
  body: { type: Object },
  params: { type: Object },
  token: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String },
  assinedTo: { type: String },
});

module.exports = mongoose.model("Log", LogSchema);
