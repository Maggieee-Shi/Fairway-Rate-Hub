import React, { useState, useRef, useEffect } from "react";
import { askAI, fetchHistory, recordView } from "../api";
import { renderAIResponse } from "../components/AIResponse";

function HistoryPanel({ onSelect }) {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchHistory()
      .then((d) => setHistory(d.history))
      .catch(() => {});
  }, []);

  if (history.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "1px solid var(--gray-200)",
          borderRadius: 8,
          padding: "8px 14px",
          cursor: "pointer",
          fontSize: "0.85rem",
          color: "var(--green-dark)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {open ? "▲" : "▼"} My Search History ({history.length})
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            border: "1px solid var(--gray-200)",
            borderRadius: 10,
            overflow: "hidden",
            maxHeight: 340,
            overflowY: "auto",
          }}
        >
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid var(--gray-100)",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--gray-700)",
                    fontWeight: 500,
                    flex: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => onSelect(item.question)}
                >
                  {item.question}
                </span>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      const isOpening = expanded !== item.id;
                      setExpanded(isOpening ? item.id : null);
                      if (isOpening) recordView({ question_id: item.id }).catch(() => {});
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--green-mid)",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {expanded === item.id ? "Hide" : "View"}
                  </button>
                  <button
                    onClick={() => onSelect(item.question)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--gray-500)",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Ask again
                  </button>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: 2 }}>
                {item.asked_at ? new Date(item.asked_at).toLocaleString() : ""}
              </div>
              {expanded === item.id && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    background: "var(--green-pale)",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    color: "var(--gray-700)",
                    lineHeight: 1.6,
                  }}
                >
                  {renderAIResponse(item.answer)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const handleHistorySelect = (question) => {
    setInput(question);
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

        <HistoryPanel onSelect={handleHistorySelect} />

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
              {msg.role === "ai" ? renderAIResponse(msg.text) : msg.text}
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
