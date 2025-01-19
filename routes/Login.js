const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../models/User");

// router.get("/log", (req, res) => {
//   res.render("Login", { messages: req.flash() });
// });

router.post("/submit-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    req.session.user = user;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });


    let mailOptions = {
      from: '"Your App Name" <your-email@gmail.com>',
      to: user.email,
      subject: "Login Confirmation",
      text: `Hello ${user.name},\n\nYou have successfully logged into your account.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});


module.exports = router;
