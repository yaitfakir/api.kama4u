const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  fileName: { type: String },
  isDefault: { type: Boolean, default: false },
  photo: { type: String },
  imageSize: { type: Number },
  post: { type: mongoose.Types.ObjectId },
  thumbnail: { type: String },
  url: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);
