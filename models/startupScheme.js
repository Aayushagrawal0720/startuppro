const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const startupSchema = mongoose.Schema({
  startup_name: {
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

  email_official: {
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
  email_personal: {
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
  website_link: {
    type: String,
  },
  social_links: {
    type: Array,
    // validate(value) {
    //   const link = validate.isURL(value);
    //   if (!link) {
    //     console.log("incorrect link");
    //   },
    // },
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zip_code: {
    type: Number,
    required: true,
    maxlength: 6,
  },
  description_of_idea: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  Industry: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  founders: {
    type: Array,
    required: true,
  },
  about_company: {
    type: String,
    required: true,
    default: "No description",
  },
  pic_url: {
    type: String,
    default: "/default_profile.png",
  },
  start_date: {
    type: Date,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//method for generating authorization tokens
startupSchema.methods.getAuthTokens = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "superisupar", {
    expiresIn: "10h",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Hashing password
startupSchema.pre("save", async function (next) {
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

const startup = mongoose.model("startup", startupSchema);

module.exports = startup;
