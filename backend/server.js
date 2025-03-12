// const express = require("express");
// const cors = require("cors");
// const ytdl = require("ytdl-core");

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post("/download", async (req, res) => {
//     const { url } = req.body;
//     if (!ytdl.validateURL(url)) {
//         return res.status(400).json({ error: "Invalid URL" });
//     }

//     try {
//         res.header("Content-Disposition", 'attachment; filename="song.mp3"');
//         ytdl(url, { filter: "audioonly", format: "mp3" }).pipe(res);
//     } catch (error) {
//         res.status(500).json({ error: "Download failed" });
//     }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ytdl = require("ytdl-core");

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Mongoose Schema
const songSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  title: String,
  artist: String,
  fileSize: String,
  format: String,
  quality: [String], // Array of available qualities
});

const Song = mongoose.model("Song", songSchema);

// API to check if song exists in DB
app.post("/check-song", async (req, res) => {
  try {
    const { url } = req.body;
    const song = await Song.findOne({ url });
    res.json({ found: !!song, data: song || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API to fetch song details and store in DB if not found
app.post("/fetch-song", async (req, res) => {
  try {
    const { url } = req.body;
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const existingSong = await Song.findOne({ url });
    if (existingSong) {
      return res.json(existingSong);
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const artist = info.videoDetails.author.name;
    const format = "mp3"; // Assume audio format
    const qualityOptions = info.formats.map((f) => f.qualityLabel).filter(Boolean);
    const fileSize = info.formats[0]?.contentLength 
      ? `${(info.formats[0].contentLength / (1024 * 1024)).toFixed(2)} MB` 
      : "Unknown";

    // Store in MongoDB
    const newSong = new Song({ url, title, artist, fileSize, format, quality: qualityOptions });
    await newSong.save();

    res.json({ title, artist, fileSize, format, qualityOptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch song details" });
  }
});

// API to download song with selected quality
app.get("/download", async (req, res) => {
  try {
    const { url, quality } = req.query;
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    res.header("Content-Disposition", 'attachment; filename="song.mp3"');
    ytdl(url, { quality: quality, filter: "audioonly" }).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Download failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
