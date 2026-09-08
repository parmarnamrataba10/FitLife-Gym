const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/error');

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use(helmet());
const corsOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000'];
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use('/api', limiter);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/__debug', (req, res) => {
  const jwt = require('jsonwebtoken');
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  let verifyResult = null;
  if (bearer) {
    try {
      const decoded = jwt.verify(bearer, process.env.JWT_SECRET || 'gym_management_jwt_secret_key_2026');
      verifyResult = { ok: true, id: decoded.id };
    } catch (err) {
      verifyResult = { ok: false, error: err.message };
    }
  }
  res.json({
    url: req.url,
    hasAuthHeader: !!auth,
    bearerPresent: !!bearer,
    secretLen: (process.env.JWT_SECRET || '').length,
    secretTail: (process.env.JWT_SECRET || '').slice(-4),
    verifyResult,
    headers: Object.keys(req.headers),
    cookies: req.cookies
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/members', require('./routes/members'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diets', require('./routes/diets'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));

app.use(errorHandler);

module.exports = app;
