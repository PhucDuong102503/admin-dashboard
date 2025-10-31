import { NextResponse } from "next/server";
import pool from "@/lib/connect";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute("UPDATE user SET matkhau = ? WHERE email = ?", [
      hashed,
      email,
    ]);

    return NextResponse.json({
      success: true,
      message: "Mật khẩu đã được cập nhật",
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi cập nhật mật khẩu" },
      { status: 500 }
    );
  }
}
