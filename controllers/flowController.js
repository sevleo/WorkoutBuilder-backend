const asyncHandler = require("express-async-handler");
const Flow = require("../models/flow");

exports.createFlow = asyncHandler(async (req, res, next) => {
  try {
    const newFlow = new Flow({
      userId: "123",
      flowName: "flow name",
      difficulty: "easy",
    });
    await newFlow.save();
    res.status(200).json({ message: "Flow added" });
  } catch (err) {
    return next(err);
  }
});
