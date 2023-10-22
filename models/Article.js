const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String }, //Draft - Pending - Published
  content: { type: String },
  image: { type: String },
  tags: [{ type: String }],
  owner: { type: mongoose.Types.ObjectId, ref: "User" },
  clicked: { type: Number, default: 0 },
  like: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Article", articleSchema);
