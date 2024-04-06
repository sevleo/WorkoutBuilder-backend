const asyncHandler = require("express-async-handler");
const Flow = require("../models/flow");

exports.createFlow = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  try {
    const newFlow = new Flow({
      userId: req.body.userId,
      flowName: req.body.flowName,
      difficulty: req.body.flowDifficulty,
    });
    await newFlow.save();
    res.status(200).json({ message: "Flow added" });
  } catch (err) {
    return next(err);
  }
});
