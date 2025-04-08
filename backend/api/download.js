const ytdl = require("@distube/ytdl-core");

module.exports = async (req, res) => {
  const { url, quality } = req.query;

  try {
    if (!ytdl.validateURL(url)) return res.status(400).json({ error: "Invalid URL" });

    const info = await ytdl.getInfo(url);
    let format = ytdl.chooseFormat(info.formats, { quality }) || 
                 ytdl.chooseFormat(info.formats, { filter: "audioandvideo" });

    if (!format) return res.status(404).json({ error: "No suitable format found" });

    res.setHeader("Content-Disposition", 'attachment; filename="media.mp4"');

    ytdl(url, { format }).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
};
