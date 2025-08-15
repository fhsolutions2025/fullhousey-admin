import mongoose from "mongoose";

const RgsSchema = new mongoose.Schema({
  game: { type: String, required: true },              // e.g. 'housie', 'ludo', 'saanp-seedhi'
  region: { type: String, required: true },            // e.g. 'IN-MH', 'IN-GJ'
  payoutType: { type: String, required: true },        // e.g. 'cash', 'bonus', 'coupon'
  rtp: { type: Number, required: true },               // e.g. 93.5
  showId: { type: String, required: false },           // optional: used for specific shows
  bonusType: { type: String, required: false },        // e.g. 'match', 'flat', etc.
  lastUpdatedBy: { type: String, required: true },     // agent name or user
  reason: { type: String, required: true },            // why was it updated?
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rgs || mongoose.model("Rgs", RgsSchema);
