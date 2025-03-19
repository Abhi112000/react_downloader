/*
To start the server: "node server.js"
Currently it is downloading the all video of the YT and keep storing the new URL to the database 

*/



const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ytdl = require("@distube/ytdl-core"); // Use maintained version

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "mediaCollection" })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define Mongoose Schema
const songSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    title: String,
    artist: String,
    fileSize: String,
    format: String,
    quality: [String], // Array of available qualities
  },
  { collection: "media" }
);

const Song = mongoose.model("Song", songSchema);

// API to check if song exists in DB
app.post("/check-song", async (req, res) => {
  try {
    const { url } = req.body;
    const song = await Song.findOne({ url });

    if (!song) {
      return res.json({ found: false, data: {} });
    }

    res.json({ found: true, data: song });
  } catch (error) {
    console.error("❌ Error in check-song:", error);
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
    const format = "mp3";
    const qualityOptions = info.formats.map((f) => f.qualityLabel).filter(Boolean);
    const fileSize = info.formats[0]?.contentLength
      ? `${(info.formats[0].contentLength / (1024 * 1024)).toFixed(2)} MB`
      : "Unknown";

    const newSong = new Song({ url, title, artist, fileSize, format, quality: qualityOptions });
    await newSong.save();

    res.json({ title, artist, fileSize, format, qualityOptions });
  } catch (error) {
    console.error("❌ Error in fetch-song:", error);
    res.status(500).json({ error: "Failed to fetch song details" });
  }
});

// API to download video/audio
app.get("/download", async (req, res) => {
  try {
    const { url, quality } = req.query;

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    console.log(`🎵 Downloading: ${url} | Quality: ${quality || "Best Available"}`);
    res.header("Content-Disposition", 'attachment; filename="media.mp4"');

    const info = await ytdl.getInfo(url);
    let format = ytdl.chooseFormat(info.formats, { quality }) || 
                 ytdl.chooseFormat(info.formats, { filter: "audioandvideo" }) ||
                 ytdl.chooseFormat(info.formats, { filter: "audioonly" });

    if (!format) {
      return res.status(404).json({ error: "No suitable format found" });
    }

    ytdl(url, { format }).pipe(res);
  } catch (error) {
    console.error("❌ Error in /download:", error);
    res.status(500).json({ error: "Download failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




 