const mongoose = require('mongoose');

const activationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pillowSize: {
      type: String,
      enum: ['S', 'M', 'L', 'XL'],
      required: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

activationCodeSchema.statics.generateUniqueCode = async function () {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let exists = true;

  while (exists) {
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    code = `SP-${randomPart}`;
    exists = await this.findOne({ code });
  }

  return code;
};

module.exports = mongoose.model('ActivationCode', activationCodeSchema);
