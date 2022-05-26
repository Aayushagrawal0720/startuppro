const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
  p_name:{
    type:String,
    required: true
  },
  p_phone:{
      type: Number,
      required: true
  },
  p_email:{
      type:String,
      required: true
  },
  p_msg:{
      type:String,
      required: true
  }
});


module.exports = new mongoose.model("contact_datas", contactSchema);
