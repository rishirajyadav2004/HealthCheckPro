const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },  // Ensure age is a number and required
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] }, // Restrict gender to these values
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
