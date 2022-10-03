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
  type_of_graph: {
    type: String,
    required: true,
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
const bargGraphEvent = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  type_id: {
    type: String,
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
  // value: {
  //   type: Number,
  //   required: true,
  // },
  
});

const dynamicColSchemas = { typeSchema, typeEventSchema, bargGraphEvent };

module.exports = dynamicColSchemas;
