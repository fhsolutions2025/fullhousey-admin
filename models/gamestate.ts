import mongoose from 'mongoose';

const gameStateSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  gameType: { type: String, enum: ['jaldi5', 'saanpseedhi', 'ludo'], required: true },
  status: { type: String, enum: ['waiting', 'live', 'finished'], required: true },
  ticket: [String],
  drawNumbers: [String],
  playerId: { type: String, required: true },
  modifiers: {
    bonusType: String,
    rtpBoost: Number,
    segmentId: String,
  },
  timestamp: { type: Number, default: () => Date.now() },
});

export const GameStateModel = mongoose.models.GameState || mongoose.model('GameState', gameStateSchema);
