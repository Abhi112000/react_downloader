
// To start the server: "node server.js"
// Currently it is downloading the all video of the YT and keep storing the new URL to the database 

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ytdl = require("@distube/ytdl-core");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, { dbName: "mediaCollection" })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Schema definition
const songSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, unique: false },
        title: String,
        artist: String,
        fileSize: String,
        format: String,
        quality: String, // Only one quality selected
    },
    { collection: "media" }
);

const Song = mongoose.model("Song", songSchema);

// Check if song exists in DB
app.post("/check-song", async (req, res) => {
    try {
        const { url, quality } = req.body;
        const song = await Song.findOne({ url, quality });

        if (!song) {
            return res.json({ found: false, data: {} });
        }

        res.json({ found: true, data: song });
    } catch (error) {
        console.error("❌ Error in check-song:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get video details without saving
app.post("/fetch-song", async (req, res) => {
    try {
        const { url } = req.body;
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid URL" });
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const artist = info.videoDetails.author.name;
        const format = "mp4";

        const formatDetails = info.formats
            .filter((f) => f.qualityLabel && f.contentLength)
            .map((f) => ({
                quality: f.qualityLabel,
                fileSize: `${(f.contentLength / (1024 * 1024)).toFixed(2)} MB`,
            }));

        // Remove duplicate qualities (keep first occurrence)
        const uniqueQualities = Array.from(
            new Map(formatDetails.map((f) => [f.quality, f])).values()
        );

        res.json({
            title,
            artist,
            format,
            qualityOptions: uniqueQualities.map((q) => q.quality),
            qualityDetails: uniqueQualities, // [{ quality: "360p", fileSize: "7.53 MB" }, ...]
        });
    } catch (error) {
        console.error("❌ Error in fetch-song:", error);
        res.status(500).json({ error: "Failed to fetch song details" });
    }
});

// Download and save on download only
// Download and save on download only (always save to DB)
app.get("/download", async (req, res) => {
    try {
        const { url, quality } = req.query;

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid URL" });
        }

        const info = await ytdl.getInfo(url);

        // Try to match requested quality
        const format = ytdl.chooseFormat(info.formats, {
            quality: info.formats.find((f) => f.qualityLabel === quality)?.itag,
        });

        if (!format || !format.contentLength) {
            return res.status(404).json({ error: "Requested quality not available" });
        }

        const fileSize = `${(format.contentLength / (1024 * 1024)).toFixed(2)} MB`;
        const title = info.videoDetails.title;
        const artist = info.videoDetails.author.name;

        // Always save to DB (skip checking for existing record)
        const newSong = new Song({
            url,
            title,
            artist,
            fileSize,
            format: "mp4",
            quality,
        });
        await newSong.save().catch(err => {
            // Handle duplicate key error silently if needed
            if (err.code !== 11000) throw err;
        });

        res.header("Content-Disposition", `attachment; filename="media.mp4"`);
        ytdl(url, { format }).pipe(res);
    } catch (error) {
        console.error("❌ Error in /download:", error);
        res.status(500).json({ error: "Download failed" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
