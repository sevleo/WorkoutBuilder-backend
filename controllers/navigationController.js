const asyncHandler = require("express-async-handler");
const passport = require("../helpers/passportInitializer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.home = asyncHandler(async (req, res) => {
  res.render("index", { user: req.user });
});

exports.signup = asyncHandler(async (req, res) => {
  res.render("sign-up-form");
});

exports.loginFederatedGoogle = asyncHandler(async (req, res, next) => {
  passport.authenticate("google")(req, res, next);
});

exports.redirectGoogle = asyncHandler(async (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/redirect",
    failureRedirect: "/redirect",
  })(req, res, next);
});

exports.redirectFrontend = asyncHandler(async (req, res, next) => {
  res.redirect("http://localhost:5173/");
});

exports.loginPassword = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Incorrect username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ user: user });
    });
  })(req, res, next);
});

exports.checkLogin = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    // User is logged in
    res.locals.currentUser = req.user;
    res.status(200).json({
      isLoggedIn: true,
      user: req.user,
    });
  } else {
    // User is not logged in
    res.status(200).json({ isLoggedIn: false });
  }
});

exports.logout = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // res.redirect("/");
    res.status(200).send("Logged out successfully.");
  });
});

exports.signUp = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.username === "") {
      return res.status(409).json({ message: "Username missing" });
    }
    if (req.body.password === "") {
      return res.status(409).json({ message: "Password missing" });
    }
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        const result = await newUser.save();
        res.redirect("/");
      } else {
        return res.status(409).json({ message: "Username exists" });
      }
    });
  } catch (err) {
    return next(err);
  }
});
