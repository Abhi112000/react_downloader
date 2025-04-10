// /*To start the frontend: " npm run dev" */


// import { useState } from "react";
// import axios from "axios";
// import "./index.css";

// function App() {
//   const [url, setUrl] = useState("");
//   const [songDetails, setSongDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [downloading, setDownloading] = useState(false);
//   const [selectedQuality, setSelectedQuality] = useState("");

//   const checkSong = async () => {
//     if (!url) {
//       alert("⚠️ Please enter a URL");
//       return;
//     }

//     setLoading(true);
//     try {
//       const checkResponse = await axios.post("http://localhost:5000/check-song", { url });

//       if (checkResponse.data.found) {
//         setSongDetails(checkResponse.data.data);
//       } else {
//         const fetchResponse = await axios.post("http://localhost:5000/fetch-song", { url });
//         setSongDetails(fetchResponse.data);
//       }
//     } catch (error) {
//       alert("❌ Error fetching song details");
//     }
//     setLoading(false);
//   };

//   const handleDownload = async () => {
//     setDownloading(true);
//     try {
//       const response = await axios.get("http://localhost:5000/download", {
//         params: { url, quality: selectedQuality || "" }, 
//         responseType: "blob",
//       });

//       const blob = new Blob([response.data], { type: "video/mp4" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "media.mp4";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       alert("❌ Failed to download the media");
//     }
//     setDownloading(false);
//   };

//   return (
//     <div className="container">
//       <header>
//         <h1>🎶 Song Downloader</h1>
//       </header>

//       <main>
//         <input
//           type="text"
//           placeholder="Enter song URL"
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//           className="input-field"
//         />
//         <button onClick={checkSong} disabled={loading} className="btn">
//           {loading ? <span className="loader"></span> : "Get Details"}
//         </button>

//         {songDetails && (
//           <div className="song-details">
//             <h3>🎵 Song Details</h3>
//             <p><strong>Title:</strong> {songDetails.title || "Unknown Title"}</p>
//             <p><strong>Artist:</strong> {songDetails.artist || "Unknown Artist"}</p>
//             <p><strong>File Size:</strong> {songDetails.fileSize || "N/A"}</p>
//             <p><strong>Format:</strong> {songDetails.format || "N/A"}</p>

//             <p><strong>Select Quality (Optional):</strong></p>
//             <select
//               value={selectedQuality}
//               onChange={(e) => setSelectedQuality(e.target.value)}
//               className="select-box"
//               disabled={!Array.isArray(songDetails.qualityOptions) || songDetails.qualityOptions.length === 0}
//             >
//               <option value="">Best Available</option>
//               {songDetails.qualityOptions?.map((quality, index) => (
//                 <option key={index} value={quality}>{quality}</option>
//               ))}
//             </select>

//             <button onClick={handleDownload} className="btn download-btn" disabled={downloading}>
//               {downloading ? <span className="loader"></span> : "Download"}
//             </button>
//           </div>
//         )}
//       </main>

//       <footer>
//         <p>&copy;2025 Song Downloader</p>
//       </footer>
//     </div>
//   );
// }

// export default App;







/* To start the frontend: "npm run dev" */

import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [url, setUrl] = useState("");
  const [songDetails, setSongDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [displayedFileSize, setDisplayedFileSize] = useState("");
  const [persistedFileSize, setPersistedFileSize] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 9000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const showTemporaryPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const checkSong = async () => {
    if (!url) {
      showTemporaryPopup("⚠️ Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const checkResponse = await axios.post("http://localhost:5000/check-song", { url });

      if (checkResponse.data.found) {
        setSongDetails(checkResponse.data.data);
        const fileSize = checkResponse.data.data.fileSize || "";
        setDisplayedFileSize(fileSize);
        setPersistedFileSize(fileSize);
      } else {
        const fetchResponse = await axios.post("http://localhost:5000/fetch-song", { url });
        setSongDetails(fetchResponse.data);
        const fileSize = fetchResponse.data.fileSize || "";
        setDisplayedFileSize(fileSize);
        setPersistedFileSize(fileSize);
      }

      setSelectedQuality("");
    } catch (error) {
      showTemporaryPopup("❌ Error fetching song details");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios.get("http://localhost:5000/download", {
        params: { url, quality: selectedQuality || "" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "media.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showTemporaryPopup("✅ Download Completed!");
    } catch (error) {
      showTemporaryPopup("❌ Failed to download the media");
    }
    setDownloading(false);
  };

  const handleQualityChange = (event) => {
    const selected = event.target.value;
    setSelectedQuality(selected);

    const fileSize =
      songDetails?.qualityDetails?.find((q) => q.quality === selected)?.fileSize ||
      songDetails?.fileSize ||
      "N/A";

    setDisplayedFileSize(fileSize);
    setPersistedFileSize(fileSize);
  };

  return (
    <div className="container">
      <header>
        <h1>🎶 Song Downloader</h1>
      </header>

      <main>
        <input
          type="text"
          placeholder="Enter song URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-field"
        />
        <button onClick={checkSong} disabled={loading} className="btn">
          {loading ? <span className="loader"></span> : "Get Details"}
        </button>

        {songDetails && (
          <div className="song-details">
            <h3>🎵 Song Details</h3>
            <p><strong>Title:</strong> {songDetails.title || "Unknown Title"}</p>
            <p><strong>Artist:</strong> {songDetails.artist || "Unknown Artist"}</p>
            <p><strong>File Size:</strong> {displayedFileSize || "N/A"}</p>
            <p><strong>Format:</strong> {songDetails.format || "N/A"}</p>

            {/* {songDetails.qualityDetails?.length > 0 && (
              <>
                <label>Select Quality:</label>
                <select value={selectedQuality} onChange={handleQualityChange}>
                  <option value="">Auto</option>
                  {songDetails.qualityDetails.map((q) => (
                    <option key={q.quality} value={q.quality}>
                      {q.quality}
                    </option>
                  ))}
                </select>
              </>
            )} */}

            <div className="quality-download-section">
              <div className="quality-dropdown">
                <label htmlFor="quality" className="dropdown-label">Select Quality:</label>
                <select
                  id="quality"
                  value={selectedQuality}
                  onChange={handleQualityChange}
                  className="dropdown"
                >
                  <option value="">Auto</option>
                  {songDetails.qualityDetails?.map((q) => (
                    <option key={q.quality} value={q.quality}>
                      {q.quality}
                    </option>
                  ))}
                </select>
              </div>

            </div>


            <div style={{ position: "relative", marginTop: "20px" }}>
              <button onClick={handleDownload} disabled={downloading} className="btn">
                {downloading ? <span className="loader"></span> : "Download"}
              </button>

              {showPopup && (
                <div className="popup">{popupMessage}</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
