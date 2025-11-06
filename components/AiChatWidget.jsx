"use client";

import React, { useState, useRef, useEffect } from "react";

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await res.json();

      const reply = data?.reply || "Xin lỗi, tôi chưa thể phản hồi lúc này.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error("Lỗi gọi Gemini:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, tôi không thể phản hồi lúc này.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút tròn nổi */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl z-50 hover:bg-green-700"
      >
        💬
      </button>

      {/* Popup chat */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-lg z-50 flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-green-600 text-white px-4 py-2 font-bold">
            Trợ lý AI gợi ý sản phẩm
          </div>

          <div className="p-3 space-y-2 max-h-64 overflow-y-auto text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded ${
                  msg.role === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
              >
                <div>{msg.content}</div>
                <div className="text-xs text-gray-400 mt-1">{msg.time}</div>
              </div>
            ))}
            {loading && (
              <p className="text-sm text-gray-500">Đang phản hồi...</p>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex border-t p-2 gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bạn muốn hỏi gì?"
              className="flex-1 border px-2 py-1 rounded text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
