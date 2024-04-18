const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlowSchema = new Schema(
  {
    userId: { type: String, required: true },
    flowName: { type: String, required: true },
    flowData: { type: Object },
    creationDate: { type: Date },
  },
  { collection: "flows" }
);
module.exports = mongoose.model("Flow", FlowSchema);
