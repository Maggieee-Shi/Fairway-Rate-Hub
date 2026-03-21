import React, { useState, useRef, useEffect } from "react";
import { askAI } from "../api";

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (!line.trim()) {
      elements.push(<br key={key++} />);
      continue;
    }

    // Bullet points
    if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
      const content = line.trim().replace(/^[•-]\s*/, "");
      elements.push(
        <div key={key++} style={{ paddingLeft: 16, marginBottom: 4 }}>
          • {formatInline(content)}
        </div>
      );
      continue;
    }

    elements.push(<p key={key++} style={{ marginBottom: 6 }}>{formatInline(line)}</p>);
  }

  return elements;
}

function formatInline(text) {
  // Handle **bold** and [label](url)
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
      // Bold
      parts.push(<strong key={i++}>{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      // Link
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
