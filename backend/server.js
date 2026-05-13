const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4000', 'http://192.168.0.102:4200', 'http://192.168.0.106:4200'],
  credentials: true,
}));
app.use(express.json());

const pillowStates = {};

function getState(code) {
  if (!pillowStates[code]) {
    pillowStates[code] = {
      lastSeen: null,
      posture: 'unknown',
      kg: 0,
      F: 0, S: 0, L: 0, R: 0,
      buzzer: false,
      calibrated: false,
      weight_ref: 60.0,
      state_duration: 0,
      confidence: 1.0,
      history: [],
      pendingCmd: null,
      calibratedOnce: false,
    };
  }
  return pillowStates[code];
}

app.use('/api/codes', require('./routes/codes'));

app.use('/api/dashboard', require('./routes/dashboard'));


const SensorData = require('./models/SensorData');
const ActivationCode = require('./models/ActivationCode');

app.post('/api/data', async (req, res) => {
  const code = req.query.code || req.body.code || 'DEFAULT';
  const d = req.body;
  const state = getState(code);

  state.lastSeen       = Date.now();
  state.posture        = d.posture        ?? state.posture;
  state.kg             = parseFloat(d.kg) || state.kg;
  state.F              = parseFloat(d.F)  || 0;
  state.S              = parseFloat(d.S)  || 0;
  state.L              = parseFloat(d.L)  || 0;
  state.R              = parseFloat(d.R)  || 0;
  state.buzzer         = d.buzzer         ?? state.buzzer;
  state.calibrated     = d.calibrated     ?? state.calibrated;
  state.weight_ref     = parseFloat(d.weight_ref) || state.weight_ref;
  state.state_duration = d.state_duration ?? state.state_duration;
  state.confidence     = parseFloat(d.confidence) || state.confidence;

  if (d.calibrated) state.calibratedOnce = true;

  if (d.posture !== 'empty' && d.posture !== undefined) {
    state.history.push({
      t: Date.now(),
      kg: state.kg,
      F: state.F, S: state.S, L: state.L, R: state.R,
      p: state.posture,
    });
    if (state.history.length > 60) state.history.shift();
  }

  try {
    if (d.posture && d.posture !== 'empty' && code !== 'DEFAULT') {
      /* Map Arduino posture to our schema */
      let postureType = 'attention';
      if (d.posture === 'good') postureType = 'correct';
      if (d.posture === 'bad') postureType = 'wrong';

      const sensors = { fl: state.F, fr: state.S, bl: state.L, br: state.R };
      const score = calculateScore(sensors);

      await SensorData.create({
        activationCode: code,
        sensors,
        weight: state.kg,
        posture: postureType,
        score,
      });
    }
  } catch (err) {
    console.error('MongoDB save error:', err.message);
  }

  if (state.pendingCmd) {
    const cmd = state.pendingCmd;
    state.pendingCmd = null;
    console.log(`[CMD->Arduino] code=${code} ${JSON.stringify(cmd)}`);
    return res.json(cmd);
  }

  res.json({});
});


app.get('/api/command', (req, res) => {
  const code = req.query.code || 'DEFAULT';
  const state = getState(code);

  if (state.pendingCmd) {
    const cmd = state.pendingCmd;
    state.pendingCmd = null;
    console.log(`[CMD->Arduino poll] code=${code} ${JSON.stringify(cmd)}`);
    return res.json(cmd);
  }
  res.json({});
});


app.get('/api/status/:code', (req, res) => {
  const { code } = req.params;
  const state = getState(code);

  const online = state.lastSeen && (Date.now() - state.lastSeen < 45000);

  res.json({
    online,
    lastSeen: state.lastSeen,
    posture: state.posture,
    kg: state.kg,
    F: state.F, S: state.S, L: state.L, R: state.R,
    buzzer: state.buzzer,
    calibrated: state.calibrated,
    calibratedOnce: state.calibratedOnce,
    weight_ref: state.weight_ref,
    state_duration: state.state_duration,
    confidence: state.confidence,
    hasPendingCmd: !!state.pendingCmd,
    pendingCmd: state.pendingCmd,
    history: state.history.slice(-30),
  });
});


app.post('/api/cmd/:code', (req, res) => {
  const { code } = req.params;
  const { cmd, value } = req.body;
  const state = getState(code);

  const allowed = ['set_weight', 'calibrate', 'buzzer_on', 'buzzer_off', 'reset_calibration'];
  if (!allowed.includes(cmd)) {
    return res.status(400).json({ error: 'Comanda necunoscuta: ' + cmd });
  }

  const command = { cmd };
  if (cmd === 'set_weight' && value !== undefined) {
    const kg = parseFloat(value);
    if (isNaN(kg) || kg < 5 || kg > 300) {
      return res.status(400).json({ error: 'Greutate invalida (5-300 kg)' });
    }
    command.value = kg;
    state.weight_ref = kg;
  }

  state.pendingCmd = command;
  console.log(`[Dashboard->Queue] code=${code} ${JSON.stringify(command)}`);
  res.json({ ok: true, queued: command });
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


function calculateScore(sensors) {
  const { fl, fr, bl, br } = sensors;
  const total = fl + fr + bl + br;
  if (total === 0) return 0;

  const nfl = (fl / total) * 100;
  const nfr = (fr / total) * 100;
  const nbl = (bl / total) * 100;
  const nbr = (br / total) * 100;

  const ideal = 25;
  const deviation =
    Math.abs(nfl - ideal) +
    Math.abs(nfr - ideal) +
    Math.abs(nbl - ideal) +
    Math.abs(nbr - ideal);

  return Math.max(0, Math.round(100 - (deviation / 150) * 100));
}

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Pillow API running on http://0.0.0.0:${PORT}`);
    console.log(`Dashboard Angular: http://localhost:4200`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});
