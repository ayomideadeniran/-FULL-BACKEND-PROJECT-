const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // User model from MongoDB
const router = express.Router();

// Render forgot-password form
// router.get("/res", (req, res) => {
//   res.render("forgot-password");
// });

// Password Reset Request
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No account with that email found.");
      return res.render("forgot-password");
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set reset token and expiration in the user document
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // Token expires in 30 minutes
    await user.save();

    // Send email with the reset token
    // const resetUrl = `https://full-frontend-project.vercel.app/ResetPassword/${resetToken}`;
    const resetUrl = `https://full-backend-project2.onrender.com/auth/reset-password/${resetToken}`;

    const message = `You are receiving this because you requested a password reset. Please click on the following link to reset your password: ${resetUrl}`;

    // Set up nodemailer
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: "Password Reset",
      text: message,
    };

    try {
      await transporter.sendMail(mailOptions);
      req.flash("success", "Password reset link sent to your email.");
      return res.render("forgot-password"); // Keep the user on the same page
    } catch (err) {
      console.error("Error sending email:", err);
      req.flash("error", "Error sending the reset email. Please try again later.");
      return res.render("forgot-password");
    }

  } catch (error) {
    console.error("Error sending password reset email:", error);
    req.flash("error", "Something went wrong. Try again later.");
    return res.render("forgot-password");
  }
});

// Render password reset form
router.get("/reset-password/:token", async (req, res) => {
  const resetToken = req.params.token;
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    // Find user with the reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Reset token is invalid or has expired.");
      return res.render("forgot-password");
    }

    // Render password reset form
    res.render("reset-password", { resetToken });
  } catch (error) {
    console.error("Error during reset password:", error);
    req.flash("error", "Something went wrong.");
    return res.render("forgot-password");
  }
});

// Handle new password submission (POST)
router.post("/reset-password/:token", async (req, res) => {
  const { password, confirmPassword } = req.body;
  const resetToken = req.params.token;
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.render("reset-password", { resetToken });
  }

  try {
    // Find user by reset token and expiration
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Reset token is invalid or has expired.");
      return res.render("forgot-password");
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    req.flash("success", "Password has been reset. You can now log in.");
    res.render("log"); // Render the login page after successful reset
  } catch (error) {
    console.error("Error resetting password:", error);
    req.flash("error", "Something went wrong.");
    return res.render("forgot-password");
  }
});

module.exports = router;
