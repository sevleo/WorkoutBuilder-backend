const asyncHandler = require("express-async-handler");
const passport = require("../helpers/passportInitializer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.loginFederatedGoogle = asyncHandler(async (req, res, next) => {
  passport.authenticate("google")(req, res, next);
});

exports.redirectGoogle = asyncHandler(async (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/redirect/",
    failureRedirect: "/redirect/sign-in",
  })(req, res, next);
});

// exports.loginFederatedFacebook = asyncHandler(async (req, res, next) => {
//   passport.authenticate("facebook")(req, res, next);
// });

// exports.redirectFacebook = asyncHandler(async (req, res, next) => {
//   passport.authenticate("facebook", {
//     successRedirect: "/redirect/",
//     failureRedirect: "/redirect/sign-in",
//   })(req, res, next);
// });

exports.redirectFrontend = asyncHandler(async (req, res, next) => {
  res.redirect(process.env.FRONTEND_URL);
});

exports.redirectFrontendSignIn = asyncHandler(async (req, res, next) => {
  res.redirect(process.env.FRONTEND_URL + "/sign-in");
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
      return res.status(200).json({ user: user, type: user.type });
    });
  })(req, res, next);
});

exports.updatePassword = asyncHandler(async (req, res, done) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const match = await bcrypt.compare(
      req.body.currentPassword,
      user._doc.password
    );

    if (!match) {
      return res
        .status(401)
        .json({ message: "The current password you entered is incorrect" });
    } else {
      bcrypt.hash(req.body.newPassword, 10, async (err, hashedPassword) => {
        const newPassword = hashedPassword;
        await user.updateOne({ password: newPassword });
      });
    }
    res.status(200).json({ message: "Successfully updated password" });
  } catch (err) {
    return done(err);
  }
});

exports.checkLogin = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    // User is logged in
    res.locals.currentUser = req.user;
    const user = await User.findOne({ username: req.user.username });
    res.status(200).json({
      isLoggedIn: true,
      user: req.user,
      type: user.type,
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
        creationDate: new Date(),
        type: "password",
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
