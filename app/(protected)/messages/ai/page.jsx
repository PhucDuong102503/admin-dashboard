"use client";

import React, { useState } from "react";

export default function AiChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/recommend-products");
      const data = await res.json();

      const aiMessages = data.suggestions.map((s) => ({
        role: "assistant",
        content: s,
      }));

      setMessages((prev) => [...prev, ...aiMessages]);
    } catch (err) {
      console.error("Lỗi gọi AI:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, tôi không thể phản hồi lúc này.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Trợ lý AI gợi ý sản phẩm</h2>

      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto border p-3 rounded">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user"
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Đang phản hồi...</p>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bạn muốn hỏi gì?"
          className="flex-1 border px-3 py-2 rounded"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
