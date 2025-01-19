const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
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
      res.status(500).json({ message: "Image upload failed." });
    }
  }
);

// Handle image deletion
router.delete("/delete-image", async (req, res) => {
  const { imageId, email } = req.body; // Receive the imageId and email

  try {
    // Find and delete the image by email and imageId
    const imageToDelete = await Image.findOneAndDelete({ email, _id: imageId });

    if (!imageToDelete) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Send a success response
    res.json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image." });
  }
});

module.exports = router;
