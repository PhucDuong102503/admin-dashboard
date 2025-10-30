import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const { sender_id, receiver_id, message } = await req.json();

    if (!sender_id || !receiver_id || !message) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu gửi tin nhắn" },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO thoitrang.messages (sender_id, receiver_id, content, created_at)
       VALUES (?, ?, ?, NOW())`,
      [sender_id, receiver_id, message]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Lỗi ghi tin nhắn:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi lưu tin nhắn" },
      { status: 500 }
    );
  }
}
