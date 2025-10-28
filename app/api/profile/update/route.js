import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const { userId, hoten, email, sodienthoai, diachi } = await req.json();

    if (!userId || !hoten || !email || !sodienthoai || !diachi) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    await pool.query(
      "UPDATE user SET hoten = ?, email = ?, sodienthoai = ?, diachi = ? WHERE id = ?",
      [hoten, email, sodienthoai, diachi, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Lỗi cập nhật thông tin:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}