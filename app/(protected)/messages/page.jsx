"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getUsers } from "@/services/userService";
import { sendMessage, listenMessages } from "@/services/messageService";

export default function MessagesPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [adminId, setAdminId] = useState(null);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const { id } = JSON.parse(stored);
      if (id) {
        setAdminId(String(id));
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông tin admin từ localStorage:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  }, []);

  useEffect(() => {
    if (!adminId) return;
    fetchUsers();
  }, [adminId, fetchUsers]);

  useEffect(() => {
    if (!adminId || !selectedUser) return;

    if (unsubscribeRef.current) unsubscribeRef.current();

    unsubscribeRef.current = listenMessages(adminId, selectedUser.id, (msgs) =>
      setMessages(msgs || [])
    );

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [adminId, selectedUser]);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
  }, [messages]);

  useEffect(
    () => () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    },
    []
  );

  const handleSelectUser = (user) => {
    if (user.id === selectedUser?.id) return;
    setSelectedUser(user);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!content.trim() || !selectedUser || !adminId) return;
    try {
      await sendMessage({
        sender_id: adminId,
        receiver_id: selectedUser.id,
        content,
      });
      setContent("");
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
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
        {users.length > 0 ? (
          users.map((user) => (
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
          ))
        ) : (
          <p className="text-gray-400 text-sm">Không có người dùng nào.</p>
        )}
      </div>

      {/* Khung chat */}
      <div className="w-2/3 flex flex-col justify-between p-4">
        {selectedUser ? (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                💬 Đang chat với:{" "}
                {selectedUser.hoten || `User ${selectedUser.id}`}
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
                    {msg.created_at
                      ? new Date(
                          msg.created_at.seconds
                            ? msg.created_at.seconds * 1000
                            : msg.created_at
                        ).toLocaleString("vi-VN")
                      : ""}
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
          <p className="text-gray-400 text-sm">
            Chọn người dùng để bắt đầu cuộc trò chuyện.
          </p>
        )}
      </div>
    </div>
  );
}
