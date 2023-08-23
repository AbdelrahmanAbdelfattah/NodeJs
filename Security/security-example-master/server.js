const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
//helmet is a group of middlewares that enhance the security
const helmet = require("helmet");
const cookieSessions = require("cookie-sessions");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");

require("dotenv").config();

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  done(null, profile);
}

//initialize google oauth strategy that takes two parameters
//1- options
//2-verify callback function
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = express();

app.use(helmet());

app.use(
  cookieSessions({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

/*
Passport initialization.
Intializes Passport for incoming requests, allowing authentication strategies
to be applied.
middleware that initialize passport session.
*/
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true; //TODO
  if (isLoggedIn) {
    return res.status(401).json({ error: "You must log in" });
  }
  next();
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure", // when the authentication fails
    successRedirect: "/", // when the authentication succeeds
    session: false,
  }),
  (req, res) => {
    console.log("Google called us back!");
  }
);
app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("Your personal secret value is 42!");
});

app.get("/failure", (req, res) => {
  return res.send("Failed to log in!");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
