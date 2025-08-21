const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const session = require("express-session");
const crypto = require("crypto");
const path = require("path");
const MongoStore = require("connect-mongo");

dotenv.config();

const app = express();
app.enable('trust proxy');

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3002", credentials: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Refresh Token Model
const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true },
});

const RefreshToken = mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);

const ChecklistSchema = new mongoose.Schema(
  {
    cabinNumber: { type: Number, required: true },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
    },
    guestName: { type: String },
    clearDoorCodes: { type: Boolean, default: false },
    resetThermostats: { type: Boolean, default: false },
    cleanACFilter: {
      type: String,
      enum: ["Checked, Not Needed", "Done"],
      default: "Checked, Not Needed",
    },
    checkUnderBedsSofa: { type: Boolean, default: false },
    checkShower: { type: Boolean, default: false },
    bathTowels: { type: Number, default: 4, min: 0, max: 4 },
    handTowels: { type: Number, default: 2, min: 0, max: 2 },
    washCloths: { type: Number, default: 4, min: 0, max: 4 },
    makeupCloths: { type: Number, default: 2, min: 0, max: 2 },
    bathMat: { type: Number, default: 1, min: 0, max: 1 },
    shampoo: { type: Number, default: 1, min: 0, max: 1 },
    conditioner: { type: Number, default: 1, min: 0, max: 1 },
    bodyWash: { type: Number, default: 1, min: 0, max: 1 },
    bodyLotion: { type: Number, default: 1, min: 0, max: 1 },
    barSoap: { type: Number, default: 1, min: 0, max: 1 },
    soapDispenser: { type: Number, default: 0, min: 0, max: 1 },
    toiletPaper: { type: Number, default: 2, min: 0, max: 2 },
    bathroomCups: { type: Number, default: 0, min: 0, max: 7 },
    kleenex: { type: Number, default: 1, min: 0, max: 1 },
    bathCheckLights: { type: Number, default: 0, min: 0, max: 5 },
    gatherTowels: { type: Boolean, default: false },
    waterBottles: { type: Number, default: 4, min: 0, max: 4 },
    coffeePods: { type: Number, default: 0, min: 0, max: 12 },
    coffeeSweeteners: { type: Number, default: 0, min: 0, max: 12 },
    coffeeCreamer: { type: Number, default: 0, min: 0, max: 12 },
    coffeeCupsCeramic: { type: Number, default: 0, min: 0, max: 4 },
    coffeeCupsPaper: { type: Number, default: 4, min: 0, max: 4 },
    coffeeCupLids: { type: Number, default: 4, min: 0, max: 4 },
    coffeeStirrers: { type: Number, default: 0, min: 0, max: 12 },
    emptyRelineTrashCans: { type: Number, default: 2, min: 0, max: 2 },
    emptyCoffeeWater: { type: Boolean, default: false },
    emptyCoffeePod: { type: Boolean, default: false },
    paperTowels: { type: Number, default: 0, min: 0, max: 1 },
    dishSoap: { type: Number, default: 0, min: 0, max: 1 },
    emptyRefrigerator: { type: Boolean, default: false },
    emptyMicrowaveOven: { type: Boolean, default: false },
    lockBattery: { type: Number, default: 0, min: 0, max: 4 },
    smokeAlarmBattery: { type: Number, default: 0, min: 0, max: 2 },
    motionDetectorBattery: { type: Number, default: 0, min: 0, max: 2 },
    doorSensorBattery: { type: Number, default: 0, min: 0, max: 2 },
    livingCheckLights: { type: Number, default: 0, min: 0, max: 5 },
    tvRemoteUnderTV: { type: Boolean, default: false },
    stripQueenBeds: {
      type: String,
      enum: ["Not Needed", "Bundled", "OK"],
      default: "Not Needed",
    },
    stripKingBeds: {
      type: String,
      enum: ["Not Needed", "Bundled", "OK"],
      default: "Not Needed",
    },
    shakeRugs: { type: Boolean, default: false },
    restockInventory: { type: String, default: "" },
    damagesYesNo: { type: Boolean, default: false },
    damagesDescription: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Checklist = mongoose.models.Checklist || mongoose.model("Checklist", ChecklistSchema);

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      item: String,
      quantity: Number,
      cabin: Number,
    },
  ],
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      if (profile.emails[0].value === process.env.ALLOWED_EMAIL) {
        return done(null, profile);
      }
      return done(null, false, { message: "Unauthorized" });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    const user = req.user;
    // Generate access token (short-lived)
    const accessToken = jwt.sign({ user: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Generate refresh token (long-lived)
    const refreshToken = crypto.randomBytes(32).toString("hex");

    // Store refresh token in DB with user ID and expiration (e.g., 7 days)
    await new RefreshToken({
      token: refreshToken,
      userId: user.id,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    // Redirect with both tokens (or send in response body; adjust for security)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3002";
    res.redirect(
      `${frontendUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

// Refresh endpoint
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });
  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expires < new Date()) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { user: storedToken.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Optional: Rotate refresh token (delete old, issue new)
    await RefreshToken.deleteOne({ token: refreshToken });
    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    await new RefreshToken({
      token: newRefreshToken,
      userId: storedToken.userId,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Cart Endpoints
app.get("/api/cart", authMiddleware, async (req, res) => {
  console.log("Fetching cart for user:", req.user);
  const cart = await Cart.findOne({ userId: req.user });
  res.json(cart ? cart.items : []);
  console.log("Cart found:", cart ? cart.items : "No cart");
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  const { item, quantity, cabin } = req.body;
  console.log("Cart post: " + JSON.stringify(req.body, null, 2));
  let cart = await Cart.findOne({ userId: req.user });
  if (!cart) {
    console.log("New cart");
    cart = new Cart({ userId: req.user, items: [] });
  }
  cart.items.push({ item, quantity, cabin });
  await cart.save();
  res.json(cart.items);
});

app.delete("/api/cart/:index", authMiddleware, async (req, res) => {
  const index = parseInt(req.params.index);
  const cart = await Cart.findOne({ userId: req.user });
  if (cart) {
    cart.items.splice(index, 1);
    await cart.save();
  }
  res.json(cart ? cart.items : []);
});

app.get("/api/checklists", authMiddleware, async (req, res) => {
  const checklists = await Checklist.find().sort({ createdAt: -1 });
  res.json(checklists);
});

app.get("/api/checklists/:id", authMiddleware, async (req, res) => {
  const checklist = await Checklist.findById(req.params.id);
  res.json(checklist);
});

app.post("/api/checklists", authMiddleware, async (req, res) => {
  const existing = await Checklist.findOne({
    cabinNumber: req.body.cabinNumber,
    completed: false,
  });
  if (existing) {
    const updated = await Checklist.findByIdAndUpdate(existing._id, req.body, {
      new: true,
    });
    return res.json(updated);
  }
  const checklist = new Checklist(req.body);
  await checklist.save();
  res.json(checklist);
});

app.put("/api/checklists/:id", authMiddleware, async (req, res) => {
  const updated = await Checklist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

app.delete("/api/checklists/:id", authMiddleware, async (req, res) => {
  await Checklist.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.get("/api/pending-summaries-old", authMiddleware, async (req, res) => {
  const pendings = await Checklist.find({ completed: false });
  const aggregated = {};
  const perCabin = {};

  pendings.forEach((cl) => {
    const cabin = cl.cabinNumber;
    if (!perCabin[cabin]) perCabin[cabin] = {};
    Object.keys(cl.toObject()).forEach((key) => {
      if (
        typeof cl[key] === "number" &&
        cl[key] > 0 &&
        !["cabinNumber"].includes(key)
      ) {
        aggregated[key] = (aggregated[key] || 0) + cl[key];
        perCabin[cabin][key] = cl[key];
      }
    });
  });

  res.json({ aggregated, perCabin, pendings });
});

app.get("/api/pending-summaries", authMiddleware, async (req, res) => {
  try {
    const pendings = await Checklist.find({ completed: false });
    const aggregated = {};
    const perCabin = {};

    pendings.forEach((cl) => {
      const cabin = cl.cabinNumber;
      if (!perCabin[cabin]) perCabin[cabin] = {};
      Object.keys(cl.toObject()).forEach((key) => {
        if (
          typeof cl[key] === "number" &&
          cl[key] > 0 &&
          !["cabinNumber"].includes(key)
        ) {
          aggregated[key] = (aggregated[key] || 0) + cl[key];
          perCabin[cabin][key] = cl[key];
        }
      });
    });

    res.json({ aggregated, perCabin, pendings });
  } catch (err) {
    console.error("Error in pending-summaries:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;