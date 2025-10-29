"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function MessagesPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [adminId, setAdminId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const { id } = JSON.parse(stored);
      setAdminId(id);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/messages/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  const fetchMessages = async (userId) => {
    if (!adminId) return;
    try {
      const res = await fetch(
        `/api/messages?sender_id=${userId}&receiver_id=${adminId}`
      );
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages.reverse());
        scrollToBottom();
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy tin nhắn:", error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const handleSend = async () => {
    if (!content.trim() || !selectedUser || !adminId) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: adminId,
          receiver_id: selectedUser.id,
          content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setContent("");
        fetchMessages(selectedUser.id);
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi tin nhắn:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex h-[80vh] bg-[#1e1e1e] text-white rounded-xl overflow-hidden shadow-lg mt-10">
      {/* Danh sách người dùng */}
      <div className="w-1/3 border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">👥 Người dùng</h2>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-[#2a2a2a] ${
              selectedUser?.id === user.id ? "bg-[#2a2a2a]" : ""
            }`}
          >
            <Image
              src={user.hinhanh || "/images/default-avatar.jpg"}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full object-cover"
              unoptimized
            />
            <span className="text-sm">{user.hoten || `User ${user.id}`}</span>
          </div>
        ))}
      </div>

      {/* Khung chat */}
      <div className="w-2/3 flex flex-col justify-between p-4">
        {selectedUser ? (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                💬 Đang chat với: {selectedUser.hoten || `User ${selectedUser.id}`}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                    msg.sender_id === adminId
                      ? "bg-blue-600 ml-auto text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {msg.content}
                  <div className="text-[10px] text-gray-300 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-[#2f2f2f] border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm">Chọn người dùng để bắt đầu trò chuyện.</p>
        )}
      </div>
    </div>
  );
}