const express = require("express");
const Image = require("../models/Image");
const router = express.Router();

// router.get("/Fetch", (req, res) => {
//   res.render("Imagefetch");
// });

// Route to fetch all images by email
// Backend (Node.js Express)

// Backend should send image metadata including imageId
router.get("/images/:email", async (req, res) => {
  try {
    const images = await Image.find({ email: req.params.email });
    if (images.length > 0) {
      res.json({
        images: images.map((image) => ({
          _id: image._id,
          image: image.image.toString("base64"),
          contentType: image.contentType,
        })),
      });
    } else {
      res.status(404).json({ message: "No images found." });
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Error fetching images." });
  }
});

module.exports = router;

