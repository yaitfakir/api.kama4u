const mongoose = require("mongoose");

const RateSchema = new mongoose.Schema({
  serveur: { type: String },
  prixEur: { type: Number },
  prixUsd: { type: Number },
  prixDh: { type: Number },
  etat: { type: Boolean },
  type: { type: String },
  sort: { type: String },
});

module.exports = mongoose.model("Rate", RateSchema);
