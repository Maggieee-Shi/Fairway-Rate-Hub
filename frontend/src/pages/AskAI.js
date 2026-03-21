import React, { useState, useRef, useEffect } from "react";
import { askAI, fetchHistory } from "../api";
import { getCourseImage } from "../courseImages";

function formatInline(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={i++}>{text.slice(last, match.index)}</span>);
    }
    parts.push(
      <strong key={i++} style={{ color: "var(--green-dark)" }}>
        {match[1]}
      </strong>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<span key={i++}>{text.slice(last)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

function CourseBlock({ block, blockIndex }) {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  // First line is the course name (may be **bold**)
  const nameLine = lines[0].replace(/^\*\*|\*\*$/g, "");
  const imageUrl = getCourseImage(nameLine, blockIndex);
  const rest = lines.slice(1);

  const bullets = [];
  const desc = [];

  for (const line of rest) {
    if (line.startsWith("•") || line.startsWith("-")) {
      bullets.push(line.replace(/^[•-]\s*/, ""));
    } else {
      desc.push(line);
    }
  }

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--gray-200)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={imageUrl}
          alt={nameLine}
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nameLine + " golf course")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "rgba(255,255,255,0.92)",
            color: "var(--green-dark)",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 20,
            textDecoration: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          📍 View on Maps
        </a>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--green-dark)",
            marginBottom: 6,
          }}
        >
          {nameLine}
        </h3>
        {desc.map((d, i) => (
          <p key={i} style={{ color: "var(--gray-700)", fontSize: "0.9rem", marginBottom: 8, lineHeight: 1.6 }}>
            {formatInline(d)}
          </p>
        ))}
        {bullets.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: "0.875rem",
                  color: "var(--gray-700)",
                  marginBottom: 4,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "var(--green-mid)", flexShrink: 0 }}>•</span>
                <span>{formatInline(b)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function renderAIResponse(text) {
  // Split on --- separator (with optional surrounding whitespace/newlines)
  const rawBlocks = text.split(/\n\s*---\s*\n/);

  // Check if response looks like structured course blocks
  const hasCourseBlocks = rawBlocks.some(
    (b) => b.trim().match(/^\*\*[^*]+\*\*/) || b.trim().match(/^[A-Z][^•\n]{5,}\n/)
  );

  if (rawBlocks.length > 1 || hasCourseBlocks) {
    return rawBlocks
      .map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        return (
          <CourseBlock
            key={i}
            block={trimmed}
            blockIndex={i}
          />
        );
      })
      .filter(Boolean);
  }

  // Fallback: plain text rendering
  return text
    .split("\n")
    .map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} style={{ height: 8 }} />;
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
        const content = trimmed.replace(/^[•-]\s*/, "");
        return (
          <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 8, marginBottom: 4 }}>
            <span style={{ color: "var(--green-mid)", flexShrink: 0 }}>•</span>
            <span>{formatInline(content)}</span>
          </div>
        );
      }
      return (
        <p key={i} style={{ marginBottom: 6, lineHeight: 1.6 }}>
          {formatInline(trimmed)}
        </p>
      );
    });
}

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
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
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
