import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");

    if (!adminId) {
      return Response.json(
        { success: false, message: "Thiếu admin_id" },
        { status: 400 }
      );
    }

    const q = query(
      collection(db, "messages"),
      where("receiver_id", "==", adminId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const unreadMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const senders = Array.from(
      new Set(unreadMessages.map((msg) => msg.sender_id))
    );

    return Response.json({
      success: true,
      total: unreadMessages.length,
      senders,
      messages: unreadMessages,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông báo chưa đọc:", error);
    return Response.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
}
