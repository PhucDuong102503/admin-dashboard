import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Thiếu userId" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query("SELECT * FROM user WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("❌ Lỗi API /profile/load:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}