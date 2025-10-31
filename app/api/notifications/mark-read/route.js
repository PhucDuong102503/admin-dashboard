import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export async function POST(request) {
  try {
    const { admin_id } = await request.json();

    if (!admin_id) {
      return Response.json(
        { success: false, message: "Thiếu admin_id" },
        { status: 400 }
      );
    }

    const q = query(
      collection(db, "messages"),
      where("receiver_id", "==", admin_id),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((d) =>
      updateDoc(doc(db, "messages", d.id), { read: true })
    );

    await Promise.all(updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Lỗi khi đánh dấu đã đọc:", error);
    return Response.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
}
