import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  status: { type: String, default: "CREATED" },
  nonce: String,
  commitHex: String,
  serverSeed: String,
  clientSeed: String,
  combinedSeed: String,
  pegMapHash: String,
  rows: Number,
  dropColumn: Number,
  binIndex: Number,
  payoutMultiplier: Number,
  betCents: Number,
  pathJson: Object,
  revealedAt: Date
});

export const Round = mongoose.model("Round", roundSchema);
