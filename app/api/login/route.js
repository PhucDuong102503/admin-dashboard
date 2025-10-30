// app/api/login/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // ✅ Kiểm tra JWT_SECRET có tồn tại không
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET chưa được cấu hình trong .env.local");
      return NextResponse.json(
        { message: "Server chưa cấu hình (JWT_SECRET thiếu)" },
        { status: 500 }
      );
    }

    // ✅ Truy vấn user và role
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.matkhau, u.hoten, u.role_id, u.hinhanh, r.tenrole
       FROM user u
       LEFT JOIN role r ON u.role_id = r.id
       WHERE u.email = ? LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { message: "Sai email hoặc mật khẩu" },
        { status: 401 }
      );
    }

    // ✅ So sánh mật khẩu (hash hoặc plain)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.matkhau);
    } catch {
      isMatch = password === user.matkhau; // fallback cho dev/test
    }

    if (!isMatch) {
      return NextResponse.json(
        { message: "Sai email hoặc mật khẩu" },
        { status: 401 }
      );
    }

    // ✅ Chỉ cho phép role Admin đăng nhập
    const roleName = (user.tenrole || "").trim().toLowerCase();
    if (roleName !== "admin") {
      return NextResponse.json(
        { message: "Không có quyền truy cập (chỉ Admin được phép)" },
        { status: 403 }
      );
    }

    // ✅ Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Trả về response + cookie
    const res = NextResponse.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        hoten: user.hoten,
        hinhanh: user.hinhanh,
        role: roleName,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return res;
  } catch (err) {
    console.error("🔥 Lỗi /api/login:", err);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
