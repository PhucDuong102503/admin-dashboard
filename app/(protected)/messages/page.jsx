"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getUsers } from "@/services/userService";
import { sendMessage as sendMessageService } from "@/services/messageService";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Build conversation key exactly like your service:
 *  - convert to String
 *  - sort lexicographically
 *  - join with underscore
 */
const buildConversationKey = (a, b) => {
  const numA = Number(a);
  const numB = Number(b);
  if (numA < numB) {
    return `${numA}_${numB}`;
  } else {
    return `${numB}_${numA}`;
  }
};

export default function MessagesPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [adminId, setAdminId] = useState(null);

  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // load admin id from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const { id } = JSON.parse(stored);
      if (id) setAdminId(String(id));
    } catch (err) {
      console.error("Lỗi khi đọc thông tin admin từ localStorage:", err);
    }
  }, []);

  // fetch users list from your API
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

  // Listen messages from Firestore directly (robust)
  useEffect(() => {
    // cleanup previous listener
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current();
      } catch (e) {
        // ignore
      }
      unsubscribeRef.current = null;
    }

    if (!adminId || !selectedUser) {
      setMessages([]);
      return;
    }

    const convKey = buildConversationKey(adminId, selectedUser.id);

    // Query: only where; we sort locally to avoid ordering errors when created_at types differ
    const q = query(
      collection(db, "messages"),
      where("conversationKey", "==", convKey)
    );

    try {
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          // map docs
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          // normalize message content keys: prefer `content`, fallback to `message`
          const normalized = docs.map((m) => {
            return {
              ...m,
              sender_id: m.sender_id != null ? String(m.sender_id) : null,
              receiver_id: m.receiver_id != null ? String(m.receiver_id) : null,
              // unify body field
              content: m.content ?? m.message ?? "",
            };
          });

          // sort locally by created_at (safely handle Timestamp, number, string, or missing)
          normalized.sort((a, b) => {
            const getTime = (x) => {
              if (!x) return 0;
              // Firestore Timestamp object: has seconds
              if (x?.seconds != null)
                return x.seconds * 1000 + (x.nanoseconds || 0) / 1e6;
              // JS Date
              if (x instanceof Date) return x.getTime();
              // numeric
              if (typeof x === "number") return x;
              // string try parse
              const parsed = Date.parse(String(x));
              if (!isNaN(parsed)) return parsed;
              // fallback: 0
              return 0;
            };
            return getTime(a.created_at) - getTime(b.created_at);
          });

          setMessages(normalized);
        },
        (err) => {
          console.error("Firestore onSnapshot error (messages):", err);
          // if error, clear messages to avoid stale UI
          setMessages([]);
        }
      );

      unsubscribeRef.current = unsub;
    } catch (err) {
      console.error("Lỗi khi subscribe messages:", err);
      setMessages([]);
    }

    // cleanup when selectedUser or adminId changes/unmount
    return () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (e) {}
        unsubscribeRef.current = null;
      }
    };
  }, [adminId, selectedUser]);

  // auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // cleanup on unmount
  useEffect(
    () => () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (e) {}
        unsubscribeRef.current = null;
      }
    },
    []
  );

  const handleSelectUser = (user) => {
    if (user.id === selectedUser?.id) return;
    setSelectedUser(user);
    setMessages([]); // reset while new listener attaches
  };

  // send via your existing service (which writes to collection "messages")
  const handleSend = async () => {
    if (!content.trim() || !selectedUser || !adminId) return;

    try {
      await sendMessageService({
        sender_id: adminId,
        receiver_id: String(selectedUser.id),
        content: content,
      });

      // also write to Firestore directly as fallback to ensure realtime for web clients
      // (your sendMessageService already adds to collection(db,"messages") — this is optional)
      // await addDoc(collection(db, "messages"), {
      //   sender_id: String(adminId),
      //   receiver_id: String(selectedUser.id),
      //   content,
      //   conversationKey: buildConversationKey(adminId, selectedUser.id),
      //   created_at: serverTimestamp(),
      //   read: false,
      // });

      setContent("");
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
    }
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
                String(selectedUser?.id) === String(user.id)
                  ? "bg-[#2a2a2a]"
                  : ""
              }`}
            >
              <Image
                src={
                  user.hinhanh?.startsWith("http")
                    ? user.hinhanh
                    : "/images/default-avatar.jpg"
                }
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
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                      msg.sender_id === String(adminId)
                        ? "bg-blue-600 ml-auto text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] text-gray-300 mt-1 text-right">
                      {msg.created_at
                        ? (() => {
                            const c = msg.created_at;
                            if (c?.seconds)
                              return new Date(c.seconds * 1000).toLocaleString(
                                "vi-VN"
                              );
                            if (c instanceof Date)
                              return c.toLocaleString("vi-VN");
                            const parsed = Date.parse(String(c));
                            if (!isNaN(parsed))
                              return new Date(parsed).toLocaleString("vi-VN");
                            return "";
                          })()
                        : ""}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Chưa có tin nhắn nào.</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-[#2f2f2f] border border-gray-600 rounded px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
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
