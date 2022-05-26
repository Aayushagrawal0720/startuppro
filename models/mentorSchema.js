const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const menSchema = mongoose.Schema({
  men_id: {
    type: String,
    required: true,
  },
  men_name: {
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
  men_email: {
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
  linkedin_url: {
    type: String,
  },
  pic_url: {
    type: String,
    default: "/default_profile.png",
  },
});

// Register client Pre middleware
menSchema.pre("save", async function (next) {
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

module.exports = new mongoose.model("mentors", menSchema);
