// Đường dẫn file: src/services/messageService.js

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

/**
 * 🧠 HÀM TẠO KEY ĐÚNG:
 * Tạo conversationKey bằng cách so sánh GIÁ TRỊ SỐ của hai ID.
 * Điều này đảm bảo nó đồng bộ 100% với logic trên app Android.
 */
const buildConversationKey = (a, b) => {
  const numA = Number(a);
  const numB = Number(b);
  // So sánh dạng số, không dùng localeCompare (vì "10" < "9" theo chữ cái là SAI)
  const key = numA < numB ? `${numA}_${numB}` : `${numB}_${numA}`;
  console.log("🔑 Đã tạo conversationKey:", key);
  return key;
};

/**
 * 🟢 Gửi tin nhắn - HÀM ĐÃ SỬA LẠI:
 * Phải đảm bảo 'conversationKey' được đính kèm vào dữ liệu gửi đi.
 */
export const sendMessage = async ({ sender_id, receiver_id, content }) => {
  try {
    // 1. Tạo key đúng
    const conversationKey = buildConversationKey(sender_id, receiver_id);

    // 2. Chuẩn bị dữ liệu để gửi lên Firestore
    const dataToSend = {
      sender_id: String(sender_id), // Luôn gửi ID dạng String
      receiver_id: String(receiver_id), // Luôn gửi ID dạng String
      content: String(content).trim(),
      created_at: serverTimestamp(),
      conversationKey, // ⭐ BẮT BUỘC: Đính kèm key vào đây
      read: false,
    };

    console.log("📩 Dữ liệu chuẩn bị gửi đi:", dataToSend);

    // 3. Gửi dữ liệu lên collection 'messages'
    await addDoc(collection(db, "messages"), dataToSend);

    console.log("✅ Gửi tin nhắn lên Firestore THÀNH CÔNG!");
  } catch (error) {
    console.error("❌ LỖI KHI GỬI TIN NHẮN:", error);
    // Ném lỗi ra ngoài để component có thể xử lý nếu cần
    throw error;
  }
};

/**
 * 🟣 Lắng nghe realtime tin nhắn giữa 2 người
 * Hàm này cũng phải dùng buildConversationKey đúng.
 */
export const listenMessages = (adminId, userId, callback) => {
  try {
    const messagesRef = collection(db, "messages");
    const conversationKey = buildConversationKey(adminId, userId);

    console.log("👂 Bắt đầu lắng nghe với key:", conversationKey);

    const q = query(
      messagesRef,
      where("conversationKey", "==", conversationKey),
      orderBy("created_at", "asc")
    );

    // Lắng nghe sự thay đổi realtime
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("🔥 Snapshot trả về:", snapshot.docs.length, "tin nhắn.");
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(msgs); // Gửi danh sách tin nhắn về component để cập nhật UI
      },
      (error) => {
        console.error("❌ Lỗi khi lắng nghe tin nhắn:", error);
      }
    );

    return unsubscribe; // Trả về hàm để "hủy lắng nghe" khi không cần nữa
  } catch (error) {
    console.error("❌ Lỗi ngoài khi listen messages:", error);
    return () => {};
  }
};
