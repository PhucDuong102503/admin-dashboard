import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
} from "firebase/firestore";

const buildConversationKey = (a, b) =>
  [String(a), String(b)].sort((x, y) => x.localeCompare(y)).join("_");

// 🟢 Gửi tin nhắn
export const sendMessage = async ({ sender_id, receiver_id, content }) => {
  try {
    const conversationKey = buildConversationKey(sender_id, receiver_id);
    await addDoc(collection(db, "messages"), {
      sender_id: String(sender_id),
      receiver_id: String(receiver_id),
      content,
      created_at: serverTimestamp(),
      conversationKey,
      read: false,
    });
    await addDoc(collection(db, "users"), {});
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn:", error);
  }
};

// 🟣 Lắng nghe realtime tin nhắn giữa 2 người
export const listenMessages = (adminId, userId, callback) => {
  try {
    const messagesRef = collection(db, "messages");
    const conversationKey = buildConversationKey(adminId, userId);
    // console.log("🧩 conversationKey", buildConversationKey(adminId, userId));

    const q = query(
      messagesRef,
      where("conversationKey", "==", conversationKey),
      orderBy("created_at", "asc")
    );

    // console.log(q);

    // const unsubscribe = onSnapshot(q, (snapshot) => {
    //   const msgs = snapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...doc.data(),
    //   }));
    //   callback(msgs);
    // });
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // console.log("📦 Snapshot size:", snapshot.size);
      snapshot.docs.forEach((d) => console.log("🔥", d.data()));
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(msgs);
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ Lỗi khi listen messages:", error);
    return () => {};
  }
};
