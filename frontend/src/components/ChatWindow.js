import React, { useState } from "react";

function ChatWindow({ role, onSend, messages, loading }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="chat-row"
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
            }}
          >
            <div
              className={
                "chat-bubble " +
                (msg.sender === "user"
                  ? "chat-bubble-user"
                  : "chat-bubble-bot")
              }
            >
              <strong>{msg.sender === "user" ? "You" : "Assistant"}:</strong>{" "}
              {msg.text}
            </div>
            {msg.sql && (
              <pre className="chat-sql">{msg.sql}</pre>
            )}
          </div>
        ))}
        {loading && <p className="text-muted">Thinking…</p>}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "10px", marginTop: "6px" }}
      >
        <input
          className="input"
          type="text"
          value={input}
          placeholder={
            role === "student"
              ? "Ask about your progress or which problems to solve…"
              : "Ask about class analytics or struggling students…"
          }
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          Send
        </button>
      </form>
      <p className="text-muted" style={{ marginTop: 4 }}>
        Natural language → SQL → results, powered by your backend.
      </p>
    </div>
  );
}

export default ChatWindow;
