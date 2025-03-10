const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", async (req, res) => {
    const { url } = req.body;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    try {
        res.header("Content-Disposition", 'attachment; filename="song.mp3"');
        ytdl(url, { filter: "audioonly", format: "mp3" }).pipe(res);
    } catch (error) {
        res.status(500).json({ error: "Download failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
