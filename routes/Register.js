const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const router = express.Router();

router.post("/submit-register", async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    age,
    gender,
    country,
    terms,
  } = req.body;

  // Input Validation
  if (!name || !email || !password || !confirmPassword || !age || !gender || !country) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (!terms) {
    return res.status(400).json({ message: "You must accept the terms and conditions." });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      country,
      terms: terms === true, // Convert checkbox to boolean true
    });

    // Save the user to the database
    await newUser.save();

    // Send a confirmation email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: '"Knights.dev" <infoaboutknights@gmail.com>',
      to: newUser.email,
      subject: "Registration Successful",
      text: `Hello ${newUser.name},\n\nYour registration was successful! Welcome to the platform.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "User registered successfully. A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Distinguish between different error types
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    return res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

module.exports = router;
