const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    full_name: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true,
        validate(value){
            if( !validator.isMobilePhone(value.toString(), "en-IN"))
                throw new Error("Give a valid Phone number.");
        }
    },
    email: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error("Give a valid Email Address.");
        }
    },
    message: {
        type: String,
        required: true
    }
})

module.exports = new mongoose.model("Feedback", FeedbackSchema);