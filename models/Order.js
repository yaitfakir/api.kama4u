const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  server: { type: String },
  characterName: { type: String },
  paymentMethod: { type: String },
  paymentInfo: { type: String },
  quantity: { type: Number },
  pricePerOne: { type: Number },
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
  possibleActions: {
    type: String,
    default: function () {
      {
        switch (this.status) {
          case "pending":
            return "accepted";
          case "accepted":
            return "paid";
          case "paid" || "issue" || "refund":
            return "closed";
          case "canceled":
            return "issue";
          default:
            break;
        }
        return "";
      }
    },
  },
});

function GetPossibleActions(status) {
  switch (status) {
    case "pending":
      return ["accepted", "canceled"];
    case "accepted":
      return ["paid", "canceled"];
    case "paid" || "issue" || "refund":
      return ["closed"];
    case "canceled":
      return ["issue", "refund"];
    default:
      break;
  }
  return [];
}

module.exports = mongoose.model("Order", orderSchema);
