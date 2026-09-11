import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin, FaGlobe, FaTwitter } from "react-icons/fa";
import "./App.css";
import axios from "axios";

//=========================================================
//Local testing
// const API_URL = "http://localhost:8000/predict";

//Deployed Link
const API_URL = `${import.meta.env.VITE_API_URL}/predict`;
//=========================================================

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const name_of_company = "Pintu Saini"

const supportedDishes = [
  "Biryani",
  "Chole Bhature",
  "Dabeli",
  "Dal",
  "Dhokla",
  "Dosa",
  "Jalebi",
  "Kathi-Roll",
  "Kofta",
  "Naan",
  "Pakora",
  "Paneer",
  "Panipuri",
  "Pav-Bhaji",
  "VadaPav"
];

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [showDishes, setShowDishes] = useState(false);

  const fileInputRef = useRef(null);

  // release the previous preview URL whenever it changes or the app unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(file) {
    setError(null);
    setResult(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("That file type isn't supported. Upload a JPEG, PNG, or WEBP photo.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("That photo is over 5MB. Choose a smaller file.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleImageChange(event) {
    handleFile(event.target.files[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files[0]);
  }

  async function predictImage() {
    setError(null);

    if (!image) {
      setError("Choose a photo before identifying it.");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/predict`,
        formData
      );

      setResult(response.data);

      setSampleCount((count) => count + 1);
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.detail || "Sorry! Our Backend Servers are under Maintainance.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const topMatches = result?.top3 ?? result?.topK ?? [];

  return (
    <div className="page">
      <div className="page__inner">


        <header className="masthead">
          <h1>Indian Food Classifier</h1>
          <p>
            Upload a photo of a dish and get an instant read on what it is,
            with a confidence score and its closest matches.
          </p>
        </header>

        <main className="workspace">
          <section className="upload-panel" aria-label="Upload a photo">
            <label
              className={
                "dropzone" +
                (dragActive ? " dropzone--active" : "") +
                (preview ? " dropzone--filled" : "")
              }
              htmlFor="fileUpload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                id="fileUpload"
                className="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              {preview ? (
                <img
                  className="dropzone__preview"
                  src={preview}
                  alt={`Preview of ${image?.name ?? "selected photo"}`}
                />
              ) : (
                <div className="dropzone__hint">
                  <span className="dropzone__hint-title">Drop a photo here</span>
                  <span className="dropzone__hint-sub">
                    or click to browse — JPEG, PNG, or WEBP, up to 5MB
                  </span>
                </div>
              )}
            </label>

            {image && <p className="filename">{image.name}</p>}

            <div className="actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={predictImage}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Identifying…" : "Identify dish"}
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={reset}
                disabled={loading}
              >
                Reset
              </button>
              <button
                className="btn btn--primary"
                onClick={() => setShowDishes(true)}
              >
                Supported Dishes
              </button>
            </div>

            {error && (
              <p className="alert" role="alert">
                {error}
              </p>
            )}
          </section>

          
        {showDishes && (
          <div className="dish-modal">
            <div className="dish-card">
              <h2>
                Supported Dishes
              </h2>

              <p className="dish-subtitle">
                Our model can identify these 15 dishes
              </p>
            <div className="dish-grid">

            {supportedDishes.map((dish, index) => (

              <div 
                className="dish-item"
                key={index}
              >
              <span className="dish-number">
                {dish}
              </span>

              </div>
          ))}

          </div>
              <button
                className="glass-button close-button"
                onClick={() => setShowDishes(false)}
              >
                Close
              </button>
            </div>
          </div>
          )}


          <section
            className={"result-panel" + (result ? " result-panel--filled" : "")}
            aria-live="polite"
          >
            {!result && !loading && (
              <div className="result-panel__idle">
                <p>Nothing to identify yet.</p>
                <p className="result-panel__idle-sub">
                  Add a photo on the left, then press Identify dish.
                </p>
              </div>
            )}

            {loading && (
              <div className="result-panel__loading">
                <p className="result-panel__loading-label">
                  Analyzing your food photo…
                </p>

                <p className="result-panel__loading-hint">
                  The first prediction may take a little longer while the AI model warms up.
                  Future predictions will be faster.
                </p>

                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--bar" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
              </div>
            )}

            {result && !loading && (
              <>
                <div className="result-panel__head">
                  <span className="tag">No. {String(sampleCount).padStart(3, "0")}</span>
                  <h2>{result.prediction}</h2>
                </div>

                <div className="confidence">
                  <div className="confidence__track">
                    <div
                      className="confidence__fill"
                      style={{ width: `${Math.min(result.confidence * 100, 100)}%` }}
                    />
                  </div>
                  <span className="confidence__value">
                    {(result.confidence * 100).toFixed(2)}%
                  </span>
                </div>

                <p className="latency">{result.latency} ms</p>

                {topMatches.length > 0 && (
                  <div className="matches">
                    <h3>Closest matches</h3>
                    <ul>
                      {topMatches.map((item, index) => (
                        <li key={item.label ?? index}>
                          <span className="matches__rank">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="matches__label">{item.label}</span>
                          <span className="matches__value">
                            {(item.confidence * 100).toFixed(2)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      
        <footer className="mt-16 border-t pt-6 text-center text-gray-500">
          <p className="font-semibold text-green-700">
            Built with ❤️ using React, FastAPI and PyTorch
          </p>

          <p className="mt-2 text-black-700"> © 2026 {name_of_company} </p>

          <div className="flex justify-center gap-4 mt-4">
            <a
              href="https://github.com/pintu1803"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button">
              <FaGithub />  
              GitHub
            </a>

            <a
              href="https://linkedin.com/in/pinsaini-in"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button"> 
              <FaLinkedin />
              LinkedIn
            </a>

            <a
              href="https://x.com/okpintuok"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button">
              <FaTwitter />
              Twitter
            </a>


            <a
              href="https://github.com/pintu1803"
              target="_blank"
              rel="noopener noreferrer"
             className="glass-button">
              <FaGlobe />
              Portfolio
            </a>
          </div>

        </footer>

      </div>

    </div>
  );
}

export default App;



