import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import { sendChatMessage } from "../api";

function ChatPage() {
  const { role } = useParams(); // "student" or "instructor"
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    const newUserMsg = { sender: "user", text };
    setMessages((prev) => [...prev, newUserMsg]);

    try {
      setLoading(true);
      const resp = await sendChatMessage(role, text);
      const newBotMsg = {
        sender: "bot",
        text: resp.reply || "(no reply text)",
        sql: resp.sql_used || null,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        sender: "bot",
        text: "Error talking to assistant.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const title =
    role === "instructor"
      ? "Instructor Chat Assistant"
      : "Student Chat Assistant";

  const subtitle =
    role === "instructor"
      ? "Ask cohort-level questions in English. The assistant will translate them into SQL over your teaching data."
      : "Ask about your progress or which problems to do next. The assistant will query your submissions and leaderboard stats.";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      <ChatWindow
        role={role}
        messages={messages}
        loading={loading}
        onSend={handleSend}
      />
    </div>
  );
}

export default ChatPage;
