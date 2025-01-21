const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const User = require("../models/User"); // Import the User model
const Image = require("../models/Image"); // Import the Image model
const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store image in memory as a buffer
const upload = multer({ storage });

// Handle the image upload
router.post(
  "/submit-upload",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { email } = req.body;
      const imageFile = req.file;

      // Check if the email exists in the User database
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "Email not registered. Image upload denied." });
      }

      // Create a new image record
      const newImage = new Image({
        email,
        image: imageFile.buffer, // Store image as a buffer in the database
        contentType: imageFile.mimetype,
      });

      // Save the image to the database
      await newImage.save();

      // Send confirmation email
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
        secure: true,
      });

      let mailOptions = {
        from: '"Your App" <your-email@gmail.com>',
        to: email,
        subject: "Profile Image Uploaded",
        text: `Hello,\n\nYour profile image has been successfully uploaded.`,
      };

      await transporter.sendMail(mailOptions);

      // Send JSON response with success message
      res.json({
        message:
          "Image uploaded successfully! A confirmation email has been sent.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Image upload failed probably you need to Registerd." });
    }
  }
);

module.exports = router;
