const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    activationCode: {
      type: String,
      required: true,
      index: true,
    },
    sensors: {
      fl: { type: Number, required: true },
      fr: { type: Number, required: true },
      bl: { type: Number, required: true },
      br: { type: Number, required: true },
    },
    weight: {
      type: Number,
      required: true,
    },
    posture: {
      type: String,
      enum: ['correct', 'attention', 'wrong'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
sensorDataSchema.index({ activationCode: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
