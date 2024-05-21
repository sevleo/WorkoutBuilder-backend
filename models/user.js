const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    creationDate: { type: Date },
    type: { type: String, required: false }, // Type of user: google, password, facebook, etc.
  },
  { collection: "users" }
);
module.exports = mongoose.model("User", UserSchema);
