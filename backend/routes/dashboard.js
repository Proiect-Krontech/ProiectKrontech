const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const ActivationCode = require('../models/ActivationCode');

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const codeDoc = await ActivationCode.findOne({ code });
    if (!codeDoc) {
      return res.status(404).json({
        success: false,
        message: 'Invalid activation code.',
      });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const latestReading = await SensorData.findOne({ activationCode: code })
      .sort({ timestamp: -1 })
      .lean();

    const todayReadings = await SensorData.find({
      activationCode: code,
      timestamp: { $gte: todayStart },
    })
      .sort({ timestamp: 1 })
      .lean();

    const weekReadings = await SensorData.find({
      activationCode: code,
      timestamp: { $gte: weekAgo },
    })
      .sort({ timestamp: 1 })
      .lean();

    const dailyChart = buildDailyChart(todayReadings);

    const timeDistribution = calculateTimeDistribution(todayReadings);

    const dailyScore = calculateDailyScore(todayReadings);

    const quickStats = calculateQuickStats(todayReadings);

    const weeklyHistory = buildWeeklyHistory(weekReadings);

    res.json({
      success: true,
      data: {
        currentPosture: latestReading || null,
        dailyChart,
        timeDistribution,
        dailyScore,
        quickStats,
        weeklyHistory,
        pillowSize: codeDoc.pillowSize,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data.',
    });
  }
});

function buildDailyChart(readings) {
  const hours = {};

  for (let h = 0; h < 24; h++) {
    hours[h] = { correct: 0, attention: 0, wrong: 0, total: 0 };
  }

  readings.forEach((r) => {
    const hour = new Date(r.timestamp).getHours();
    hours[hour][r.posture]++;
    hours[hour].total++;
  });

  return Object.entries(hours).map(([hour, data]) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    correct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    attention: data.total > 0 ? Math.round((data.attention / data.total) * 100) : 0,
    wrong: data.total > 0 ? Math.round((data.wrong / data.total) * 100) : 0,
  }));
}

function calculateTimeDistribution(readings) {
  if (readings.length === 0) {
    return { correct: 0, attention: 0, wrong: 0 };
  }

  const counts = { correct: 0, attention: 0, wrong: 0 };
  readings.forEach((r) => counts[r.posture]++);

  const total = readings.length;
  return {
    correct: Math.round((counts.correct / total) * 100),
    attention: Math.round((counts.attention / total) * 100),
    wrong: Math.round((counts.wrong / total) * 100),
  };
}

function calculateDailyScore(readings) {
  if (readings.length === 0) return 0;
  const sum = readings.reduce((acc, r) => acc + r.score, 0);
  return Math.round(sum / readings.length);
}

function calculateQuickStats(readings) {
  const intervalMinutes = 0.5;
  const totalMinutes = readings.length * intervalMinutes;

  const counts = { correct: 0, attention: 0, wrong: 0 };
  readings.forEach((r) => counts[r.posture]++);

  return {
    totalTime: formatTime(totalMinutes),
    correctTime: formatTime(counts.correct * intervalMinutes),
    attentionTime: formatTime(counts.attention * intervalMinutes),
    wrongTime: formatTime(counts.wrong * intervalMinutes),
  };
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function buildWeeklyHistory(readings) {
  const days = {};
  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    days[key] = { scores: [], dayName: dayNames[date.getDay()] };
  }

  readings.forEach((r) => {
    const key = new Date(r.timestamp).toISOString().split('T')[0];
    if (days[key]) {
      days[key].scores.push(r.score);
    }
  });

  return Object.entries(days).map(([date, data]) => ({
    date,
    day: data.dayName,
    score: data.scores.length > 0
      ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
      : 0,
  }));
}

module.exports = router;
