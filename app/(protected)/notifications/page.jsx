"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const { id } = JSON.parse(storedUser);

    fetch(`/api/messages/unread?admin_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.messages);
      });
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold mb-4">🔔 Thông báo mới</h2>
      {messages.length === 0 ? (
        <p className="text-gray-400">Không có tin nhắn mới nào.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="bg-[#2f2f2f] p-4 rounded-lg">
              <div className="text-sm text-gray-300 mb-1">
                Từ người dùng ID: {msg.sender_id}
              </div>
              <div className="text-white">{msg.content}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(msg.created_at).toLocaleString("vi-VN")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}