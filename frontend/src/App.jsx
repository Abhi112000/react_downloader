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

import { useState } from "react";
import axios from "axios";

function App() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!url) {
            alert("Please enter a URL");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/download", { url }, { responseType: "blob" });
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
        setLoading(false);
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
            <button onClick={handleDownload} disabled={loading} style={{ padding: "10px 20px" }}>
                {loading ? "Downloading..." : "Download"}
            </button>
        </div>
    );
}

export default App;


