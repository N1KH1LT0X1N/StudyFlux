import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "./userModel.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
console.log("Looking for .env at:", envPath);
console.log("File exists?", fs.existsSync(envPath));
dotenv.config({ path: envPath });


// 🔹 Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// 🔹 Local Signup
passport.use("local-signup", new LocalStrategy(
  { usernameField: "email", passwordField: "password", passReqToCallback: true },
  async (req, email, password, done) => {
    try {
      let user = await User.findOne({ email });
      if (user) return done(null, false, { message: "Email already exists" });

      const hashed = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashed });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// 🔹 Local Login
passport.use("local-login", new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "No user found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

console.log("DEBUG - GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("DEBUG - GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// 🔹 Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));
