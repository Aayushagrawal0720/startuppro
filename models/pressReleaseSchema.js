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
    imagePress:{
        type: String,
        default:"/default-image.jpg",
    },
    second: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imagePress: {
        type: String,
        default: "/default_profile.png",
    },
});

module.exports = pressReleaseSchema;
