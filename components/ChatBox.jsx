"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatBox({ currentUser, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const chatId =
    currentUser.id < targetUser.id
      ? `${currentUser.id}_${targetUser.id}`
      : `${targetUser.id}_${currentUser.id}`;

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("created_at", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1️⃣ Gửi lên Firestore (Realtime)
    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender_id: currentUser.id,
      receiver_id: targetUser.id,
      message: input,
      created_at: serverTimestamp(),
    });

    // 2️⃣ Gửi về API để lưu vào MySQL
    await fetch("/api/messages/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: currentUser.id,
        receiver_id: targetUser.id,
        message: input,
      }),
    });

    // 3️⃣ Clear ô nhập
    setInput("");
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.sender_id === currentUser.id ? "sent" : "received"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
}
