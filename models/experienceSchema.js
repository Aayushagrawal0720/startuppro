const mongoose = require("mongoose");

const caExperienceSchema = new mongoose.Schema({
    certificate_no: {
        type: String,
    },
    certificate: {
        type: String,
    },
    experience: {
        type: String,
        required: true,
    }
});

const mentorExperienceSchema = new mongoose.Schema({
    resume: {
        type: String,
    },
    experience: {
        type: String,
        required: true,
        value: [],
    }
}
);

const userExperienceSchema = new mongoose.Schema({
    resume: {
        type: String,
    },
    experience: {
        type: String,
        required: true,
        value: [],
    }
}
);

const dynamicExperienceSchema = { caExperienceSchema, mentorExperienceSchema, userExperienceSchema };



module.exports = dynamicExperienceSchema;
