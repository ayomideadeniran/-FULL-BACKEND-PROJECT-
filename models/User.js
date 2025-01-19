const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  age: {
    type: Number,
    required: true,
    min: 18,
  },
  gender: {
    type: String,
    enum: ["male", "female", "Male", "Female"],
    required: true,
  },
  
  country: {
    type: String,
    required: true,
  },
  terms: {
    type: Boolean,
    required: true,
    validate: {
      validator: function (v) {
        return v === true || v === false;
      },
      message: "You must accept the terms and conditions",
    },
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
