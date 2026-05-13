const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const ActivationCode = require('../models/ActivationCode');

router.post('/', async (req, res) => {
  try {
    const { activationCode, sensors, weight } = req.body;

    if (!activationCode || !sensors || weight === undefined) {
      return res.status(400).json({
        success: false,
        message: 'activationCode, sensors, and weight are required.',
      });
    }

    const codeDoc = await ActivationCode.findOne({ code: activationCode });
    if (!codeDoc) {
      return res.status(404).json({
        success: false,
        message: 'Invalid activation code.',
      });
    }

    const { posture, score } = calculatePosture(sensors);

    const sensorData = new SensorData({
      activationCode,
      sensors,
      weight,
      posture,
      score,
    });
    await sensorData.save();

    res.status(201).json({
      success: true,
      posture,
      score,
      message: 'Sensor data recorded.',
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving sensor data.',
    });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const latest = await SensorData.findOne({ activationCode: code })
      .sort({ timestamp: -1 })
      .lean();

    if (!latest) {
      return res.json({
        success: true,
        data: null,
        message: 'No sensor data available yet.',
      });
    }

    res.json({
      success: true,
      data: latest,
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

function calculatePosture(sensors) {
  const { fl, fr, bl, br } = sensors;
  const ideal = 25;

  const deviation =
    Math.abs(fl - ideal) +
    Math.abs(fr - ideal) +
    Math.abs(bl - ideal) +
    Math.abs(br - ideal);

  const score = Math.max(0, Math.round(100 - (deviation / 150) * 100));

  let posture;
  if (score >= 70) {
    posture = 'correct';
  } else if (score >= 40) {
    posture = 'attention';
  } else {
    posture = 'wrong';
  }

  return { posture, score };
}

module.exports = router;
