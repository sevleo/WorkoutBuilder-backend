const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlowSchema = new Schema(
  {
    userId: { type: String, required: true },
    flowName: { type: String, required: true },
    difficulty: { type: String, required: false },
    flowData: { type: Object },
  },
  { collection: "flows" }
);
module.exports = mongoose.model("Flow", FlowSchema);
