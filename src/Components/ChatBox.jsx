import { useState } from "react";
import "./ChatBox.css"; // Add custom CSS for styling

const ChatBox = ({ onSendMessage }) => {
  const [messages, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [view, setView] = useState("chat");
  const [level, setLevel] = useState(1); // Track user's progress in the game

  // Handle message submission to AI
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (messages.trim()) {
      const message = onSendMessage(messages);
      console.log("Message being sent:", message);

      setLoading(true);

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
        setAiResponse(result.response);
        console.log("Response from backend:", result);

        // Increase the level after receiving a response (simulating game progression)
        setLevel((prevLevel) => prevLevel + 1);
      } catch (error) {
        console.error("Error sending message to backend:", error);
      } finally {
        setLoading(false);
      }

      setMessage("");
    }
  };

  // Chat Interface
  const renderChatInterface = () => (
    <div className="chat-interface">
      <h3 className="game-title">🧩 AI Adventure: Chat with Your Assistant!</h3>
      <div className="avatar-container">
        <img
          src="/avatar.png"
          alt="AI Assistant"
          className="ai-avatar"
        />
        <p className="avatar-text">“Hello, I’m your adventure guide! What’s your first question?”</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control game-textarea"
            placeholder="Type your prompt here..."
            value={messages}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 game-button">
          📨 Send
        </button>
        {loading && <div className="loader mt-3">AI is thinking...</div>}
        {aiResponse && (
          <button
            className="btn btn-secondary w-100 mt-3 game-button-secondary"
            onClick={() => setView("response")}
          >
            🚀 View AI Response
          </button>
        )}
      </form>
      <div className="level-indicator">
        <h4>Level {level}</h4>
        <p>You're progressing! Keep going to unlock more!</p>
      </div>
    </div>
  );

  // AI Response Interface with Progression
  const renderResponseInterface = () => (
    <div className="response-interface">
      <h3 className="game-title">🎉 AI Response: Your Journey Awaits!</h3>
      <div className="response-card">
        <p className="response-text">{aiResponse}</p>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-filled" style={{ width: `${(level * 20)}%` }}>
          Keep Going! You're Level {level}
        </div>
      </div>
      <div className="button-container">
        <button
          className="btn btn-primary w-100 mt-3 game-button"
          onClick={() => setView("chat")}
        >
          🔙 Back to AI Chat
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

  return (
    <div className="chat-container game-container">
      {view === "chat" ? renderChatInterface() : renderResponseInterface()}
    </div>
  );
};

export default ChatBox;
