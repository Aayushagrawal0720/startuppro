const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const memberSchema = mongoose.Schema({
  mid: {
    type: String,
    required: true,
  },
  member_name: {
    type: String,
    required: true,
  },
  mobile_no: {
    type: Number,
    required: true,
    validate(value) {
      const phone = validate.isMobilePhone(value.toString());
      if (!phone) {
        console.log("incorrect phone no");
      }
    },
  },
  member_Email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      const email = validate.isEmail(value);
      if (!email) {
        console.log("incorrect email");
      }
    },
  },
  isFounder: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (pass) {
        let regex =
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})";
        return pass.match(regex);
      },
    },
    minlength: 8,
  },
  pic_url: {
    type: String,
    default: "/default_profile.png",
  },
  linkedin_url:{
    type:String,
  },
  resume_url: {
    type: String,
  },
  startupAdmin: {
    type: Array,
    default: [],
  },
  startupMember: {
    type: Array,
    default: [],
  },
  skills: {
    type: Array,
    default: [],
  },
});

// Register client Pre middleware
memberSchema.pre("save", async function (next) {
  const client = this;
  try {
    if (!client) {
      throw new Error("No client");
    }

    if (client.isModified("password")) {
      client.password = await bcrypt.hash(client.password, 8);
    }

    next();
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = new mongoose.model("teamMembers", memberSchema);
