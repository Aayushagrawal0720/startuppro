const mongoose = require("mongoose");

const appliedSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  mid: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  date_applied: {
    type: Date,
    required: true,
  },
});

module.exports = new mongoose.model("appliedcandidates", appliedSchema);
