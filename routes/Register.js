const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const router = express.Router();

// router.get("/reg", (req, res) => {
//   res.render("Register");
// });

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

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/reg");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      country,
      terms: terms === true, // Convert checkbox to boolean true,
    });

    await newUser.save();

    // let transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "your-email@gmail.com",
    //     pass: "your-email-password",
    //   },
    // });


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

    // req.flash("success", "User registered successfully. A confirmation email has been sent.");

    return res
      .status(201)
      .json({
        message:
          "User registered successfully. A confirmation email has been sent.",
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
