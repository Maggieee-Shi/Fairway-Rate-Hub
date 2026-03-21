import React, { useState, useRef, useEffect } from "react";
import { askAI } from "../api";

function MapButton({ url, label }) {
  // Extract query from Google Maps URL for display
  const query = url.includes("query=")
    ? decodeURIComponent(url.split("query=")[1].replace(/\+/g, " "))
    : label;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
        padding: "7px 14px",
        background: "var(--green-pale)",
        color: "var(--green-dark)",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: "0.85rem",
        textDecoration: "none",
        border: "1px solid var(--green-light)",
      }}
    >
      📍 {query} — Open in Google Maps
    </a>
  );
}

function renderMarkdown(text) {
  // GPT sometimes returns bullets inline separated by "•" on one line.
  // Normalize: split inline bullets into separate lines first.
  const normalized = text
    .replace(/•\s*/g, "\n• ")
    .replace(/\[View on Google Maps\]/gi, "\n[View on Google Maps]");

  const lines = normalized.split("\n");
  const elements = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key++} style={{ height: 8 }} />);
      continue;
    }

    // Google Maps link line
    const mapMatch = trimmed.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (mapMatch && mapMatch[2].includes("google.com/maps")) {
      elements.push(<div key={key++}><MapButton url={mapMatch[2]} label={mapMatch[1]} /></div>);
      continue;
    }

    // Bullet point
    if (trimmed.startsWith("•")) {
      const content = trimmed.replace(/^•\s*/, "");
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 8, paddingLeft: 8, marginBottom: 4 }}>
          <span style={{ color: "var(--green-mid)", flexShrink: 0 }}>•</span>
          <span>{formatInline(content)}</span>
        </div>
      );
      continue;
    }

    // Regular line (may contain **bold**)
    elements.push(
      <p key={key++} style={{ marginBottom: 6, lineHeight: 1.6 }}>
        {formatInline(trimmed)}
      </p>
    );
  }

  return elements;
}

function formatInline(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\))/g;
  let last = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={i++}>{text.slice(last, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(<strong key={i++} style={{ color: "var(--green-dark)" }}>{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      parts.push(
        <a key={i++} href={match[4]} target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--green-mid)", fontWeight: 500 }}>
          {match[3]}
        </a>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<span key={i++}>{text.slice(last)}</span>);
  }

  return parts.length > 0 ? parts : text;
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
              {msg.role === "ai" ? renderMarkdown(msg.text) : msg.text}
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
