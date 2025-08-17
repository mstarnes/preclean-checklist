const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const session = require('express-session');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3002', credentials: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  if (profile.emails[0].value === process.env.ALLOWED_EMAIL) {
    return done(null, profile);
  }
  return done(null, false, { message: 'Unauthorized' });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`http://localhost:3002?token=${token}`);
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Checklist Model (updated enums and removed redundant field)
const ChecklistSchema = new mongoose.Schema({
  cabinNumber: { type: Number, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) },
  guestName: { type: String },
  clearDoorCodes: { type: Boolean, default: false },
  resetThermostats: { type: Boolean, default: false },
  cleanACFilter: { type: String, enum: ['', 'N/A', 'Done', 'Checked, Not Needed'], default: '' },
  checkUnderBedsSofa: { type: Boolean, default: false },
  checkShower: { type: Boolean, default: false },
  bathTowels: { type: Number, default: 4, min: 0, max: 4 },
  handTowels: { type: Number, default: 2, min: 0, max: 2 },
  washCloths: { type: Number, default: 4, min: 0, max: 4 },
  makeupCloths: { type: Number, default: 2, min: 0, max: 2 },
  bathMat: { type: Number, default: 1, min: 0, max: 1 },
  shampoo: { type: Number, default: 0, min: 0, max: 1 },
  conditioner: { type: Number, default: 1, min: 0, max: 1 },
  bodyWash: { type: Number, default: 1, min: 0, max: 1 },
  bodyLotion: { type: Number, default: 0, min: 0, max: 1 },
  barSoap: { type: Number, default: 0, min: 0, max: 1 },
  soapDispenser: { type: Number, default: 0, min: 0, max: 1 },
  toiletPaper: { type: Number, default: 1, min: 0, max: 2 },
  bathroomCups: { type: Number, default: 0, min: 0, max: 7 },
  kleenex: { type: Number, default: 0, min: 0, max: 1 },
  bathCheckLights: { type: Number, default: 0, min: 0, max: 5 },
  gatherTowels: { type: Boolean, default: false },
  waterBottles: { type: Number, default: 4, min: 0, max: 4 },
  coffeePods: { type: Number, default: 0, min: 0, max: 12 },
  coffeeSweeteners: { type: Number, default: 0, min: 0, max: 12 },
  coffeeCreamer: { type: Number, default: 0, min: 0, max: 12 },
  coffeeCupsCeramic: { type: Number, default: 0, min: 0, max: 4 },
  coffeeCupsPaper: { type: Number, default: 0, min: 0, max: 4 },
  coffeeCupLids: { type: Number, default: 0, min: 0, max: 4 },
  coffeeStirrers: { type: Number, default: 0, min: 0, max: 12 },
  emptyRelineTrashCans: { type: Number, default: 2, min: 0, max: 2 },
  emptyCoffeeWater: { type: Boolean, default: false },
  emptyCoffeePod: { type: Boolean, default: false },
  paperTowels: { type: Number, default: 0, min: 0, max: 1 }, // Cabin 3 only
  dishSoap: { type: Number, default: 0, min: 0, max: 1 }, // Cabin 3 only
  emptyRefrigerator: { type: Boolean, default: false },
  emptyMicrowaveOven: { type: Boolean, default: false },
  lockBattery: { type: Number, default: 0, min: 0, max: 4 },
  smokeAlarmBattery: { type: Number, default: 0, min: 0, max: 2 },
  motionDetectorBattery: { type: Number, default: 0, min: 0, max: 2 },
  doorSensorBattery: { type: Number, default: 0, min: 0, max: 1 },
  livingCheckLights: { type: Number, default: 0, min: 0, max: 5 },
  tvRemoteUnderTV: { type: Boolean, default: false },
  stripQueenBeds: { type: String, enum: ['', 'Bundled', 'OK', 'Not Needed'], default: '' },
  stripKingBeds: { type: String, enum: ['', 'Bundled', 'OK', 'Not Needed'], default: '' },
  shakeRugs: { type: Boolean, default: false },
  restockInventory: { type: String, default: '' },
  damagesYesNo: { type: Boolean, default: false },
  damagesDescription: { type: String },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const Checklist = mongoose.model('Checklist', ChecklistSchema);

// Routes (unchanged)
app.get('/api/checklists', authMiddleware, async (req, res) => {
  const checklists = await Checklist.find().sort({ createdAt: -1 });
  res.json(checklists);
});

app.get('/api/checklists/:id', authMiddleware, async (req, res) => {
  const checklist = await Checklist.findById(req.params.id);
  res.json(checklist);
});

app.post('/api/checklists', authMiddleware, async (req, res) => {
  const checklist = new Checklist(req.body);
  await checklist.save();
  res.json(checklist);
});

app.put('/api/checklists/:id', authMiddleware, async (req, res) => {
  const updated = await Checklist.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.get('/api/pending-summaries', authMiddleware, async (req, res) => {
  const pendings = await Checklist.find({ completed: false });
  const aggregated = {};
  const perCabin = {};

  pendings.forEach(cl => {
    const cabin = cl.cabinNumber;
    if (!perCabin[cabin]) perCabin[cabin] = {};
    Object.keys(cl.toObject()).forEach(key => {
      if (typeof cl[key] === 'number' && cl[key] > 0 && !['cabinNumber'].includes(key)) {
        aggregated[key] = (aggregated[key] || 0) + cl[key];
        perCabin[cabin][key] = cl[key];
      }
    });
  });

  res.json({ aggregated, perCabin, pendings });
});

app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`));