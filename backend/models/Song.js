const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    title: String,
    artist: String,
    fileSize: String,
    format: String,
    quality: [String],
  },
  { collection: "media" }
);

module.exports = mongoose.models.Song || mongoose.model("Song", songSchema);
