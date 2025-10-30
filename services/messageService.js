import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Gửi tin nhắn
export const sendMessage = async ({ sender_id, receiver_id, content }) => {
  await addDoc(collection(db, "messages"), {
    sender_id,
    receiver_id,
    content,
    created_at: serverTimestamp(),
  });
};

// Lắng nghe tin nhắn realtime giữa admin và user
export const listenMessages = (adminId, userId, callback) => {
  const q = query(
    collection(db, "messages"),
    where("sender_id", "in", [adminId, userId]),
    where("receiver_id", "in", [adminId, userId]),
    orderBy("created_at", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(msgs);
  });
};