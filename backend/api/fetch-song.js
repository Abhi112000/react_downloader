const connectDB = require("../utils/db");
const Song = require("../models/Song");
const ytdl = require("@distube/ytdl-core");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectDB();
    const { url } = req.body;

    if (!ytdl.validateURL(url)) return res.status(400).json({ error: "Invalid URL" });

    const existing = await Song.findOne({ url });
    if (existing) return res.json(existing);

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const artist = info.videoDetails.author.name;
    const format = "mp3";
    const qualityOptions = info.formats.map(f => f.qualityLabel).filter(Boolean);
    const fileSize = info.formats[0]?.contentLength
      ? `${(info.formats[0].contentLength / (1024 * 1024)).toFixed(2)} MB`
      : "Unknown";

    const newSong = new Song({ url, title, artist, fileSize, format, quality: qualityOptions });
    await newSong.save();

    res.json({ title, artist, fileSize, format, qualityOptions });
  } catch (err) {
    console.error("Error in fetch-song:", err);
    res.status(500).json({ error: "Failed to fetch song details" });
  }
};
