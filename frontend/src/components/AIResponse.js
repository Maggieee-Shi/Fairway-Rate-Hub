import React from "react";
import { getCourseImage } from "../courseImages";

function formatInline(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={i++}>{text.slice(last, match.index)}</span>);
    parts.push(<strong key={i++} style={{ color: "var(--green-dark)" }}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={i++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
}

function CourseBlock({ block, blockIndex }) {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const nameLine = lines[0].replace(/^\*\*|\*\*$/g, "");
  const imageUrl = getCourseImage(nameLine, blockIndex);
  const bullets = [];
  const desc = [];

  for (const line of lines.slice(1)) {
    if (line.startsWith("•") || line.startsWith("-")) {
      bullets.push(line.replace(/^[•-]\s*/, ""));
    } else {
      desc.push(line);
    }
  }

  return (
    <div style={{
      background: "var(--white)",
      border: "1px solid var(--gray-200)",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
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
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(255,255,255,0.92)", color: "var(--green-dark)",
            fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px",
            borderRadius: 20, textDecoration: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          📍 View on Maps
        </a>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--green-dark)", marginBottom: 6 }}>
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
              <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", color: "var(--gray-700)", marginBottom: 4, lineHeight: 1.5 }}>
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

export function renderAIResponse(text) {
  const rawBlocks = text.split(/\n\s*---\s*\n/);
  const hasCourseBlocks = rawBlocks.some(
    (b) => b.trim().match(/^\*\*[^*]+\*\*/) || b.trim().match(/^[A-Z][^•\n]{5,}\n/)
  );

  if (rawBlocks.length > 1 || hasCourseBlocks) {
    return rawBlocks
      .map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        return <CourseBlock key={i} block={trimmed} blockIndex={i} />;
      })
      .filter(Boolean);
  }

  // Fallback: plain text
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: 8 }} />;
    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 8, marginBottom: 4 }}>
          <span style={{ color: "var(--green-mid)", flexShrink: 0 }}>•</span>
          <span>{formatInline(trimmed.replace(/^[•-]\s*/, ""))}</span>
        </div>
      );
    }
    return <p key={i} style={{ marginBottom: 6, lineHeight: 1.6 }}>{formatInline(trimmed)}</p>;
  });
}
