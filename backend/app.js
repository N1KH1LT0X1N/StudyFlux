import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";



import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
console.log("Looking for .env at:", envPath);
console.log("File exists?", fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log("File content:\n", fs.readFileSync(envPath, "utf-8"));
}


dotenv.config({ path: envPath });

console.log("APP DEBUG - GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

import session from "express-session";
import passport from "passport";
import "./passportConfig.js"; // passport strategies


const app = express();

app.use(cors({
  origin: "http://localhost:3000",  // your frontend URL
  credentials: true                 // allow cookies (important for sessions)
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.post("/register", passport.authenticate("local-signup"), (req, res) => {
  res.json({ message: "User registered", user: req.user });
});

app.post("/login", passport.authenticate("local-login"), (req, res) => {
  res.render("");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.json({ message: "Google Login successful", user: req.user });
  }
);

app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  res.json({ message: `Welcome ${req.user.username || req.user.email}` });
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log("Server running on http://localhost:5000"));
  })
  .catch(err => console.error(err));
