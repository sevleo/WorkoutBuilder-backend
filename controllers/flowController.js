const asyncHandler = require("express-async-handler");
const Flow = require("../models/flow");
const flow = require("../models/flow");

exports.create_flow = asyncHandler(async (req, res, next) => {
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

exports.flow_list = asyncHandler(async (req, res, next) => {
  console.log(req.query);
  const allFlows = await Flow.find({ userId: req.query.userId });
  console.log(allFlows);
  res.status(200).json({ message: allFlows });
});

exports.delete_flow = asyncHandler(async (req, res, next) => {
  await Flow.findByIdAndDelete(req.query.flowId);
  res.status(200).json({ message: "deleted successfully" });
});
