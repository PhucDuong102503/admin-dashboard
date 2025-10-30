import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = parseInt(searchParams.get("admin_id"), 10);

    if (!adminId) {
      return NextResponse.json({ success: false, message: "Thiếu admin_id" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM messages m
       JOIN user u ON m.sender_id = u.id
       WHERE m.receiver_id = ? AND m.is_read = 0 AND u.role_id != 1`,
      [adminId]
    );

    return NextResponse.json({ success: true, total: rows[0].total });
  } catch (error) {
    console.error("❌ Lỗi server /api/notifications/unread:", error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}