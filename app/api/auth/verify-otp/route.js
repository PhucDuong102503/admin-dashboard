import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    // ✅ Chuyển thời gian hiện tại sang định dạng DATETIME
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [rows] = await pool.execute(
      "SELECT * FROM user WHERE email = ? AND reset_token = ? AND reset_token_expire > ?",
      [email, otp, now]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Mã OTP không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    await pool.execute(
      "UPDATE user SET reset_token = NULL, reset_token_expire = NULL WHERE email = ?",
      [email]
    );

    return NextResponse.json({ success: true, message: "Xác minh thành công" });
  } catch (error) {
    console.error("Lỗi xác minh OTP:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi xác minh OTP" },
      { status: 500 }
    );
  }
}
