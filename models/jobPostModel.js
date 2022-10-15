const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  jid: {
    type: String,
    required: true,
  },
  employment_type: {
    type: String,
    required: true,
  },
  min_qualification: {
    type: String,
    required: true,
  },
  experience_req: {
    type: Number,
    required: true,
  },
  salary: {
    type: Array,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  skills: {
    type: Array,
    required: true,
  },
  basic_info: {
    type: String,
    required: true,
  },
  job_req: {
    type: String,
  },
  perks: {
    type: String,
    required: true,
  },
  shift: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "active",
  },
  joining_from: {
    type: mongoose.SchemaTypes.Mixed,
    required: true,
    default: Date.now(),
  },
  duration: {
    type: Array,
  }
});

module.exports = new mongoose.model("jobposts", jobPostSchema);
