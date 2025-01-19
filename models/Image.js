const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  image: { type: Buffer, required: true }, // Store the image as a buffer
  contentType: { type: String, required: true }, // Store the image file type (e.g., image/jpeg)
});

module.exports = mongoose.model("Image", imageSchema);
