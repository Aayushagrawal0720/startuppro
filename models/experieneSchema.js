const mongoose = require("mongoose");

const experienceSchema = mongoose.Schema({
    ca_id: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("caexperience", experienceSchema);