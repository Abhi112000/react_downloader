// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

// import { useState } from "react";
// import axios from "axios";

// function App() {
//     const [url, setUrl] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleDownload = async () => {
//         if (!url) {
//             alert("Please enter a URL");
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await axios.post("http://localhost:5000/download", { url }, { responseType: "blob" });
//             const blob = new Blob([response.data], { type: "audio/mp3" });
//             const link = document.createElement("a");
//             link.href = URL.createObjectURL(blob);
//             link.download = "song.mp3";
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         } catch (error) {
//             alert("Failed to download the song");
//         }
//         setLoading(false);
//     };

//     return (
//         <div style={{ textAlign: "center", marginTop: "50px" }}>
//             <h1>Song Downloader</h1>
//             <input
//                 type="text"
//                 placeholder="Enter song URL"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 style={{ padding: "10px", width: "300px", marginRight: "10px" }}
//             />
//             <button onClick={handleDownload} disabled={loading} style={{ padding: "10px 20px" }}>
//                 {loading ? "Downloading..." : "Download"}
//             </button>
//         </div>
//     );
// }

// export default App;




import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [songDetails, setSongDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("");

  const checkSong = async () => {
    if (!url) {
      alert("Please enter a URL");
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
      alert("Error fetching song details");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!selectedQuality) {
      alert("Please select a quality");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/download", { url, quality: selectedQuality }, { responseType: "blob" });

      const blob = new Blob([response.data], { type: "audio/mp3" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "song.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to download the song");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Song Downloader</h1>
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
          <h3>Song Details</h3>
          <p><strong>Title:</strong> {songDetails.title}</p>
          <p><strong>Artist:</strong> {songDetails.artist}</p>
          <p><strong>File Size:</strong> {songDetails.fileSize}</p>
          <p><strong>Format:</strong> {songDetails.format}</p>
          <p><strong>Select Quality:</strong></p>
          <select value={selectedQuality} onChange={(e) => setSelectedQuality(e.target.value)} style={{ padding: "5px" }}>
            <option value="">Select Quality</option>
            {songDetails.qualityOptions.map((quality, index) => (
              <option key={index} value={quality}>{quality}</option>
            ))}
          </select>
          <br />
          <button onClick={handleDownload} disabled={!selectedQuality} style={{ marginTop: "10px", padding: "10px 20px" }}>
            Download
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
