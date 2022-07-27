const mongoose = require("mongoose");

const pressReleaseSchema = new mongoose.Schema({
    job_title: {
        type: String,
        required: true,
    },
    first: {
        type: String,
        required: true,
    },
    second: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

module.exports = pressReleaseSchema;
