import { useState } from "react";
import Tesseract from "tesseract.js";

const ImageUploader = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [messages, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(""); // Store backend response
  const [view, setView] = useState("upload"); // To toggle between upload and response view
  const [level, setLevel] = useState(1); // Level for gamification

  // Handle file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      onImageUpload(file);

      setLoading(true);
      try {
        const { data } = await Tesseract.recognize(file, "eng");
        setExtractedText(data.text);
      } catch (error) {
        console.error("Error extracting text:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Send extracted text to backend
  const sendToBackend = async () => {
    if (messages) {
      setLoading(true); // Show loading state for backend response
      try {
        const response = await fetch("http://127.0.0.1:8000/chatbot/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ content: messages }],
          }),
        });
        const result = await response.json();
        console.log("see result", result);
        setBackendResponse(result.response || "Response received successfully!"); // Store backend response
        setView("response"); // Switch to response view
      } catch (error) {
        console.error("Error sending data to backend:", error);
        setBackendResponse("Error: Unable to process the response from backend.");
        setView("response");
      } finally {
        setLoading(false);
      }
    }
  };

  // AI Response Interface with Progression
  const renderResponseInterface = () => (
    <div className="response-interface">
      <h3 className="game-title">🎉 AI Response: Your Journey Awaits!</h3>
      <div className="response-card">
        <p className="response-text">{backendResponse}</p>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-filled" style={{ width: `${(level * 20)}%` }}>
          Keep Going! You're Level {level}
        </div>
      </div>
      <div className="button-container">
        <button
          className="btn btn-primary w-100 mt-3 game-button"
          onClick={() => setView("upload")}
        >
          🔙 Back to upload file
        </button>
        <button
          className="btn btn-success w-100 mt-3 game-button"
          onClick={() => alert("Congratulations, you completed a level!")}
        >
          🌟 Complete Task
        </button>
      </div>
    </div>
  );

  // Upload Interface
  const renderUploadInterface = () => (
    <div>
      <input
        type="file"
        className="form-control mb-3 game-button"
        accept="image/*"
        onChange={handleFileChange}
      />
      {loading && <p className="text-center text-primary game-text">Extracting text, please wait...</p>}
      {messages && (
        <div className="response-interface">
          <h5 className="game-header">Extracted Text:</h5>
          <textarea
            className="form-control mb-2 game-textarea"
            rows="6"
            value={messages}
            readOnly
          />
          <button className="btn btn-success game-button" onClick={sendToBackend}>
            Send to Backend
          </button>
        </div>
      )}
      {image && (
        <div className="text-center mt-3">
          <img src={URL.createObjectURL(image)} alt="Preview" className="img-fluid rounded game-image" />
        </div>
      )}
    </div>
  );

  return (
    <div className="game-container">
      {view === "upload" ? renderUploadInterface() : renderResponseInterface()}
    </div>
  );
};

export default ImageUploader;
