import pool from "@/lib/connect";
import { NextResponse } from "next/server";

// Lấy tin nhắn giữa 2 người
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const senderId = searchParams.get("sender_id");
  const receiverId = searchParams.get("receiver_id");

  if (!senderId || !receiverId) {
    return NextResponse.json(
      { success: false, message: "Thiếu sender_id hoặc receiver_id" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, sender_id, receiver_id, content, created_at 
       FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [senderId, receiverId, receiverId, senderId]
    );

    return NextResponse.json({ success: true, messages: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy tin nhắn:", error.message);
    return NextResponse.json(
      { success: false, message: "Không thể lấy tin nhắn" },
      { status: 500 }
    );
  }
}

// Gửi tin nhắn mới
export async function POST(req) {
  const body = await req.json();
  const { sender_id, receiver_id, content } = body;

  if (!sender_id || !receiver_id || !content?.trim()) {
    return NextResponse.json(
      { success: false, message: "Thiếu dữ liệu hợp lệ" },
      { status: 400 }
    );
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
      [sender_id, receiver_id, content]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn:", error.message);
    return NextResponse.json(
      { success: false, message: "Không thể gửi tin nhắn" },
      { status: 500 }
    );
  }
}