const express = require("express");
const nodemailer = require("nodemailer");
const Registration = require("../models/Form"); // Import the Registration model
const router = express.Router();

// router.get("/form", (req, res) => {
//   res.render("Form"); // Render the registration form
// });

router.post("/submit-form", async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    nationality,
    address,
    phoneNumber,
    email,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactPhone,
    previousSchool,
    gradeLevel,
    coursesCompleted,
    gpa,
    program,
    minor,
    degreeType,
    paymentMethod,
    paymentAmount,
    financialAid,
    housingPreferences,
    extracurricularActivities,
    specialNeeds,
  } = req.body;

  try {
    const newStudent = new Registration({
      name,
      dateOfBirth,
      gender,
      nationality,
      address,
      phoneNumber,
      email,
      emergencyContact: {
        name: emergencyContactName,
        relationship: emergencyContactRelationship,
        phoneNumber: emergencyContactPhone,
      },
      previousSchool,
      gradeLevel,
      coursesCompleted,
      gpa,
      program,
      minor,
      degreeType,
      paymentMethod,
      paymentAmount,
      financialAid: financialAid === "on" ? true : false,
      housingPreferences,
      extracurricularActivities,
      specialNeeds,
    });

    await newStudent.save();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: '"School Admin" <admin@school.com>',
      to: newStudent.email,
      subject: "Registration Successful",
      text: `Hello ${newStudent.name},\n\nYour registration was successful! Welcome to the program.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: "Student registered successfully. A confirmation email has been sent." });
  } catch (error) {
    console.error("Error registering student:", error);
    return res.status(500).json({ message: "An error occurred during registration." });
  }
});

module.exports = router;
