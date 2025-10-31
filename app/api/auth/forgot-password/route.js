import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import pool from "@/lib/connect";

export async function POST(req) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json(
      { success: false, message: "Thiếu email" },
      { status: 400 }
    );

  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Nếu email tồn tại, liên kết đã được gửi.",
    });
  }

  const user = rows[0];
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 15;

  await pool.execute(
    "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?",
    [token, expires, user.id]
  );

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

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
    subject: "Đặt lại mật khẩu",
    html: `<p>Nhấn vào liên kết để đặt lại mật khẩu:</p><a href="${resetLink}">${resetLink}</a>`,
  });

  return NextResponse.json({
    success: true,
    message: "Liên kết đặt lại đã được gửi.",
  });
}
