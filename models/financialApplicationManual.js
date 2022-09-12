const mongoose = require("mongoose");
const validator = require("validator");

const ApplicationManualSchema = mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isLength(value, {min: 250}))
                throw new Error("Description should contain a minimum of 250 characters.");
        }
    },
    problem: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isLength(value, {min: 250}))
                throw new Error("Problem statement should contain a minimum of 250 characters.");
        }
    },
    solution: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isLength(value, {min: 250}))
                throw new Error("Soultion should contain a minimum of 250 characters.");
        }
    },
    customer_and_adoption: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isLength(value, {min: 250}))
                throw new Error("Early adoption segment should contain a minimum of 250 characters.")
        }
    },
    money_making: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isLength(value, {min: 250}))
                throw new Error("Money making segment should contain a minimum of 250 characters.")
        }
    },
    company_name: {
        type: String,
        required: true
    },
    brand_name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    investment_currecy: {
        type: String,
        required: true
    },
    investment_amount: {
        type: Number,
        required: true
    },
    required_funding_currecy: {
        type: String,
        required: true
    },
    required_funding_amount: {
        type: Number,
        required: true
    },
    written_commitments_currecy: {
        type: String,
        required: true
    },
    written_commitments_amount: {
        type: Number,
        required: true
    },
    challenges: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isLength(value, {min: 250}))
                throw new Error("Challenges segment should contain a minimum of 250 characters.");
        }
    }
})


module.exports = new mongoose.model("ApplicationManual", ApplicationManualSchema);