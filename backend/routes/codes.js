const express = require('express');
const router = express.Router();
const ActivationCode = require('../models/ActivationCode');

router.post('/generate', async (req, res) => {
  try {
    const { pillowSize } = req.body;

    const validSizes = ['S', 'M', 'L', 'XL'];
    if (!pillowSize || !validSizes.includes(pillowSize)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pillow size. Must be S, M, L, or XL.',
      });
    }
    const code = await ActivationCode.generateUniqueCode();

    const activationCode = new ActivationCode({
      code,
      pillowSize,
    });
    await activationCode.save();

    res.status(201).json({
      success: true,
      code,
      message: `Activation code generated for pillow size ${pillowSize}`,
    });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating activation code.',
    });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Activation code is required.',
      });
    }
    const activationCode = await ActivationCode.findOne({
      code: code.toUpperCase(),
    });

    if (!activationCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid activation code. Please check and try again.',
      });
    }
    if (!activationCode.isActivated) {
      activationCode.isActivated = true;
      activationCode.activatedAt = new Date();
      await activationCode.save();
    }

    res.json({
      success: true,
      code: activationCode.code,
      pillowSize: activationCode.pillowSize,
      message: 'Code validated successfully. Welcome to your dashboard!',
    });
  } catch (error) {
    console.error('Error validating code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating code.',
    });
  }
});

module.exports = router;
