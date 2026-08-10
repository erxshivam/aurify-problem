const mongoose = require("mongoose");

module.exports = mongoose.model("Lead", new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  website: String,
  createdAt: { type: Date, default: Date.now }
}));