const asyncHandler = require("express-async-handler");

exports.home = asyncHandler(async (req, res) => {
  res.render("index", { user: req.user });
});

exports.signup = asyncHandler(async (req, res) => {
  res.render("sign-up-form");
});
