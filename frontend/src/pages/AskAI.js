import React, { useState, useRef, useEffect } from "react";
import { askAI } from "../api";

function AskAI({ user }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! Ask me anything about Bay Area golf courses — conditions, tips, comparisons, tee times, or recommendations. ⛳`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askAI(question);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer, cached: data.cached },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="chat-container">
        <div className="page-header">
          <h1 className="page-title">Ask AI</h1>
          <p className="page-subtitle">
            GPT-4 powered — real-time Bay Area golf insights
          </p>
        </div>

        <div className="chat-history">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              <div className="chat-bubble-label">
                {msg.role === "user" ? "You" : "Fairway AI"}
                {msg.cached && <span className="cached-badge">cached</span>}
              </div>
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble chat-bubble-ai">
              <div className="chat-bubble-label">Fairway AI</div>
              <span style={{ opacity: 0.6 }}>Thinking...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. What are conditions like at Harding Park this week?"
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>

        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--gray-500)",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          Only golf-related questions are answered.
        </p>
      </div>
    </div>
  );
}

export default AskAI;
