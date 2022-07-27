const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema({
  event_title: {
    type: String,
    required: true,
  },
  picUrl: {
    type: String,
    default: "/default_profile.png",
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
});

module.exports = timelineEventSchema;
