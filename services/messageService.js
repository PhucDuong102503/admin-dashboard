import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// 🟢 Gửi tin nhắn
export const sendMessage = async ({ sender_id, receiver_id, content }) => {
  try {
    await addDoc(collection(db, "messages"), {
      sender_id: String(sender_id),
      receiver_id: String(receiver_id),
      content,
      created_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn:", error);
  }
};

// 🟣 Lắng nghe realtime tin nhắn giữa 2 người
export const listenMessages = (adminId, userId, callback) => {
  try {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("created_at", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔍 Lọc lại chỉ lấy tin nhắn giữa admin và user
      const msgs = allMsgs.filter(
        (msg) =>
          (msg.sender_id === String(adminId) &&
            msg.receiver_id === String(userId)) ||
          (msg.sender_id === String(userId) &&
            msg.receiver_id === String(adminId))
      );

      callback(msgs);
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ Lỗi khi listen messages:", error);
    return () => {};
  }
};
