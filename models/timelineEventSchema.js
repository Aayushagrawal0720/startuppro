const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema({
  event_title: {
    type: String,
    required: true,
  },
  picUrl: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = timelineEventSchema;
