"use client";
import { useEffect, useState } from "react";
import {
  listenAllNotifications,
  markAsRead,
} from "@/services/notificationService";

export default function NotificationsPage() {
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});

  // 🟢 1️⃣ Lấy danh sách người dùng 1 lần
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.success) {
          // Chuyển danh sách thành map { id: hoten }
          const map = {};
          data.users.forEach((u) => {
            map[u.id] = u.hoten || `Người dùng #${u.id}`;
          });
          setUserMap(map);
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách users:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🟣 2️⃣ Lắng nghe thông báo realtime
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const { id } = JSON.parse(storedUser);

    const unsubscribe = listenAllNotifications(id, (data) => {
      setMessages(data);

      // ✅ Tự động đánh dấu các thông báo chưa đọc là đã đọc
      data.forEach((msg) => {
        if (!msg.read) markAsRead(msg.id);
      });
    });

    return () => unsubscribe();
  }, []);

  // 🧩 3️⃣ Hiển thị danh sách thông báo
  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold mb-4">🔔 Thông báo mới</h2>
      {messages.length === 0 ? (
        <p className="text-gray-400">Không có thông báo nào.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`p-4 rounded-lg ${
                msg.read ? "bg-[#2f2f2f]" : "bg-[#3f3f3f]"
              }`}
            >
              <div className="text-sm text-gray-300 mb-1">
                👤 {userMap[msg.sender_id] || `Người dùng #${msg.sender_id}`}
              </div>
              <div className="text-white">{msg.content}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {msg.created_at
                  ? new Date(msg.created_at.seconds * 1000).toLocaleString(
                      "vi-VN"
                    )
                  : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
