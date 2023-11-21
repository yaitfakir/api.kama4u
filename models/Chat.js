const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  client: { type: mongoose.Types.ObjectId, ref: "User" },
  message: [
    {
      chatId: { type: String },
      value: { type: String },
      isRead: { type: Boolean, default: false },
      owner: { _id: String, name: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
