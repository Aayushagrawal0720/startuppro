const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  mid: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  job_title: {
    type: String,
    required: true,
  },
  from_date: {
    type: Date,
    required: true,
  },
  to_date: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  type: {
    type: String,
    required: true,
    default: "Job",
  },
});

module.exports = new mongoose.model("jobdetails", jobSchema);
