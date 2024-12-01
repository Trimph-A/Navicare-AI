import { useState } from "react";
import Tesseract from "tesseract.js";

const ImageUploader = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(""); // Store backend response

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

  const sendToBackend = async () => {
    if (extractedText) {
      setLoading(true); // Show loading state for backend response
      try {
        const response = await fetch("http://127.0.0.1:8000/chatbot/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: extractedText }),
        });
        const result = await response.json();
        setBackendResponse(result.response); // Store backend response
      } catch (error) {
        console.error("Error sending data to backend:", error);
        setBackendResponse("Error: Unable to process the response from backend.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="game-container">
      {/* File Input */}
      <input
        type="file"
        className="form-control mb-3 game-button"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Loading Indicator */}
      {loading && <p className="text-center text-primary game-text">Processing, please wait...</p>}

      {/* Extracted Text Section */}
      {extractedText && (
        <div className="response-interface">
          <h5 className="game-header">Extracted Text:</h5>
          <textarea
            className="form-control mb-2 game-textarea"
            rows="6"
            value={extractedText}
            readOnly
          />
          <button className="btn btn-success game-button" onClick={sendToBackend}>
            Send to Backend
          </button>
        </div>
      )}

      {/* Backend Response Section */}
      {backendResponse && (
        <div className="response-interface mt-4">
          <h5 className="game-header">Backend Response:</h5>
          <textarea
            className="form-control mb-2 game-textarea"
            rows="6"
            value={backendResponse}
            readOnly
          />
        </div>
      )}

      {/* Image Preview */}
      {image && (
        <div className="text-center mt-3">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="img-fluid rounded game-image"
          />
        </div>
      )}

      {/* Go Back Button */}
      <div className="button-container">
        <button className="game-button game-button-secondary" onClick={() => window.location.reload()}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
