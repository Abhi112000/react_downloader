const connectDB = require("../utils/db");
const Song = require("../models/Song");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectDB();
    const { url } = req.body;
    const song = await Song.findOne({ url });

    if (!song) return res.json({ found: false, data: {} });

    res.json({ found: true, data: song });
  } catch (error) {
    console.error("Error in check-song:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
