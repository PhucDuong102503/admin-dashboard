import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Thiếu email" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email không tồn tại" },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Chuyển sang định dạng DATETIME cho MySQL
    const expires = new Date(Date.now() + 1000 * 60 * 5)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // "YYYY-MM-DD HH:MM:SS"

    await pool.execute(
      "UPDATE user SET reset_token = ?, reset_token_expire = ? WHERE email = ?",
      [otp, expires, email]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Fashion Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác thực OTP",
      html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Mã có hiệu lực trong 5 phút.</p>`,
    });

    return NextResponse.json({
      success: true,
      message: "Đã gửi mã OTP đến email",
    });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi gửi OTP" },
      { status: 500 }
    );
  }
}
