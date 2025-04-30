
// // // To start the server: "node server.js"
// // // Currently it is downloading the all video of the YT and keep storing the new URL to the database 

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const youtubedl = require("youtube-dl-exec");

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI, { dbName: "mediaCollection" })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // Schema definition
// const songSchema = new mongoose.Schema(
//   {
//     url: { type: String, required: true },
//     title: String,
//     artist: String,
//     fileSize: String,
//     format: String,
//     quality: String,
//   },
//   { collection: "media" }
// );
// const Song = mongoose.model("Song", songSchema);

// // Check if song exists in DB
// app.post("/check-song", async (req, res) => {
//   try {
//     const { url, quality } = req.body;
//     const song = await Song.findOne({ url, quality });
//     if (!song) return res.json({ found: false, data: {} });
//     res.json({ found: true, data: song });
//   } catch (error) {
//     console.error("❌ Error in check-song:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Fetch song metadata
// app.post("/fetch-song", async (req, res) => {
//   try {
//     const { url } = req.body;
//     if (!url.startsWith("http")) return res.status(400).json({ error: "Invalid URL" });

//     const info = await youtubedl(url, {
//       dumpSingleJson: true,
//       noCheckCertificates: true,
//       noWarnings: true,
//       preferFreeFormats: true,
//     });

//     const title = info.title;
//     const artist = info.uploader;
//     const format = "mp4";

//     const formatDetails = info.formats
//       .filter(f => f.format_id && f.filesize && f.format_note)
//       .map(f => ({
//         quality: f.format_note,
//         fileSize: `${(f.filesize / (1024 * 1024)).toFixed(2)} MB`,
//         formatId: f.format_id
//       }));

//     // Remove duplicates by quality
//     const uniqueQualities = Array.from(
//       new Map(formatDetails.map(f => [f.quality, f])).values()
//     );

//     res.json({
//       title,
//       artist,
//       format,
//       qualityOptions: uniqueQualities.map(q => q.quality),
//       qualityDetails: uniqueQualities,
//     });
//   } catch (error) {
//     console.error("❌ Error in fetch-song:", error);
//     res.status(500).json({ error: "Failed to fetch song details" });
//   }
// });

// // Download + save
// app.get("/download", async (req, res) => {
//   try {
//     const { url, quality } = req.query;
//     if (!url.startsWith("http")) return res.status(400).json({ error: "Invalid URL" });

//     const info = await youtubedl(url, {
//       dumpSingleJson: true,
//     });

//     const selectedFormat = info.formats.find(f => f.format_note === quality && f.filesize);

//     if (!selectedFormat) {
//       return res.status(404).json({ error: "Requested quality not available" });
//     }

//     const fileSize = `${(selectedFormat.filesize / (1024 * 1024)).toFixed(2)} MB`;
//     const title = info.title;
//     const artist = info.uploader;

//     const newSong = new Song({
//       url,
//       title,
//       artist,
//       fileSize,
//       format: "mp4",
//       quality,
//     });

//     await newSong.save().catch(err => {
//       if (err.code !== 11000) throw err;
//     });

//     res.setHeader("Content-Disposition", `attachment; filename="media.mp4"`);

//     const stream = youtubedl.exec(url, {
//       format: selectedFormat.format_id,
//       output: "-",
//     });

//     stream.stdout.pipe(res);
//   } catch (error) {
//     console.error("❌ Error in /download:", error);
//     res.status(500).json({ error: "Download failed" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const youtubedl = require("youtube-dl-exec");

dotenv.config();

const app = express();

// Dynamic CORS for Vercel frontend
app.use(
  cors({
    origin: ["https://ytdownloaderf.vercel.app/"], // ✅ Update with your exact frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { dbName: "mediaCollection" })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Mongoose schema
const songSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: String,
    artist: String,
    fileSize: String,
    format: String,
    quality: String,
  },
  { collection: "media" }
);
const Song = mongoose.model("Song", songSchema);

// POST /check-song
app.post("/check-song", async (req, res) => {
  try {
    const { url, quality } = req.body;
    const query = quality ? { url, quality } : { url };
    const song = await Song.findOne(query);
    if (!song) return res.json({ found: false, data: {} });
    res.json({ found: true, data: song });
  } catch (error) {
    console.error("❌ Error in check-song:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /fetch-song
app.post("/fetch-song", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.startsWith("http"))
      return res.status(400).json({ error: "Invalid URL" });

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    const title = info.title;
    const artist = info.uploader;
    const format = "mp4";

    const formatDetails = info.formats
      .filter((f) => f.format_id && f.filesize && f.format_note)
      .map((f) => ({
        quality: f.format_note,
        fileSize: `${(f.filesize / (1024 * 1024)).toFixed(2)} MB`,
        formatId: f.format_id,
      }));

    // Remove duplicates by quality
    const uniqueQualities = Array.from(
      new Map(formatDetails.map((f) => [f.quality, f])).values()
    );

    res.json({
      title,
      artist,
      format,
      qualityOptions: uniqueQualities.map((q) => q.quality),
      qualityDetails: uniqueQualities,
    });
  } catch (error) {
    console.error("❌ Error in fetch-song:", error);
    res.status(500).json({ error: "Failed to fetch song details" });
  }
});

// GET /download
app.get("/download", async (req, res) => {
  try {
    const { url, quality } = req.query;
    if (!url || !url.startsWith("http"))
      return res.status(400).json({ error: "Invalid URL" });

    const info = await youtubedl(url, { dumpSingleJson: true });

    const selectedFormat = info.formats.find(
      (f) => f.format_note === quality && f.filesize
    );

    if (!selectedFormat)
      return res.status(404).json({ error: "Requested quality not available" });

    const fileSize = `${(selectedFormat.filesize / (1024 * 1024)).toFixed(2)} MB`;
    const title = info.title;
    const artist = info.uploader;

    const existing = await Song.findOne({ url, quality });
    if (!existing) {
      const newSong = new Song({
        url,
        title,
        artist,
        fileSize,
        format: "mp4",
        quality,
      });
      await newSong.save();
    }

    res.setHeader("Content-Disposition", 'attachment; filename="media.mp4"');

    const stream = youtubedl.exec(url, {
      format: selectedFormat.format_id,
      output: "-",
    });

    stream.stdout.pipe(res);
  } catch (error) {
    console.error("❌ Error in /download:", error);
    res.status(500).json({ error: "Download failed" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
