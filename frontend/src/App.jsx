import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [songDetails, setSongDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("");

  const checkSong = async () => {
    if (!url) {
      alert("⚠️ Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const checkResponse = await axios.post("http://localhost:5000/check-song", { url });

      if (checkResponse.data.found) {
        setSongDetails(checkResponse.data.data);
      } else {
        const fetchResponse = await axios.post("http://localhost:5000/fetch-song", { url });
        setSongDetails(fetchResponse.data);
      }
    } catch (error) {
      alert("❌ Error fetching song details");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:5000/download", {
        params: { url, quality: selectedQuality || "" }, // Quality is optional
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "media.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("❌ Failed to download the media");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🎶 Song Downloader</h1>
      <input
        type="text"
        placeholder="Enter song URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={checkSong} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Checking..." : "Get Details"}
      </button>

      {songDetails && (
        <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block" }}>
          <h3>🎵 Song Details</h3>
          <p><strong>Title:</strong> {songDetails.title || "Unknown Title"}</p>
          <p><strong>Artist:</strong> {songDetails.artist || "Unknown Artist"}</p>
          <p><strong>File Size:</strong> {songDetails.fileSize || "N/A"}</p>
          <p><strong>Format:</strong> {songDetails.format || "N/A"}</p>

          <p><strong>Select Quality (Optional):</strong></p>
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            style={{ padding: "5px" }}
            disabled={!Array.isArray(songDetails.qualityOptions) || songDetails.qualityOptions.length === 0}
          >
            <option value="">Best Available</option>
            {songDetails.qualityOptions?.map((quality, index) => (
              <option key={index} value={quality}>{quality}</option>
            ))}
          </select>

          <br />
          <button onClick={handleDownload} style={{ marginTop: "10px", padding: "10px 20px" }}>
            Download
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
