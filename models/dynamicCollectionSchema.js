const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  type_id: {
    type: String,
    required: true,
  },
  timeline: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const typeEventSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  type_id: {
    type: String,
    required: true,
  },
  diff: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  type_title: {
    type: String,
    required: true,
  },
  type_type: {
    type: String,
    required: true,
  },
  isLess: {
    type: Boolean,
    default: false,
  },
});

const dynamicColSchemas = { typeSchema, typeEventSchema };

module.exports = dynamicColSchemas;
