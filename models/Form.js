const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(v);
      },
      message: "Please enter a valid email address",
    },
  },
  emergencyContact: {
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  previousSchool: {
    type: String,
    required: true,
  },
  gradeLevel: {
    type: Number,
    required: true,
  },
  coursesCompleted: {
    type: [String],
  },
  gpa: {
    type: Number,
  },
  program: {
    type: String,
    required: true,
  },
  minor: {
    type: String,
  },
  degreeType: {
    type: String,
    enum: ['Bachelor', 'Master', 'PhD'], // Modify this to include "Bachelor's" if needed
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  financialAid: {
    type: Boolean,
  },
  housingPreferences: {
    type: String,
    enum: ['Shared Room', 'Single Room', 'Dormitory'], // Make sure "Single Room" is included here
  },
  extracurricularActivities: {
    type: [String],
  },
  specialNeeds: {
    type: String,
  },
});

module.exports = mongoose.model("Registration", registrationSchema);
