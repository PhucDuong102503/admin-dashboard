import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

// 🟢 Lắng nghe realtime số lượng chưa đọc
export const listenUnreadNotifications = (adminId, callback) => {
  try {
    const q = query(
      collection(db, "messages"),
      where("receiver_id", "==", String(adminId)),
      where("read", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.length);
    });
    return unsubscribe;
  } catch (error) {
    console.error("❌ Lỗi listenUnreadNotifications:", error);
    return () => {};
  }
};

// 🟣 Lắng nghe tất cả thông báo realtime
export const listenAllNotifications = (adminId, callback) => {
  try {
    const q = query(
      collection(db, "messages"),
      where("receiver_id", "==", String(adminId)),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(list);
    });
    return unsubscribe;
  } catch (error) {
    console.error("❌ Lỗi listenAllNotifications:", error);
    return () => {};
  }
};

// 🟠 Đánh dấu 1 tin là đã đọc
export const markAsRead = async (msgId) => {
  try {
    const ref = doc(db, "messages", msgId);
    await updateDoc(ref, { read: true });
  } catch (err) {
    console.error("❌ Lỗi markAsRead:", err);
  }
};
