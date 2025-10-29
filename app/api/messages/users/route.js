import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.hoten,
        u.email,
        u.hinhanh
      FROM thoitrang.\`user\` u
      LEFT JOIN thoitrang.\`role\` r ON u.role_id = r.id
      WHERE r.tenrole != 'admin'
      ORDER BY u.id DESC
    `);

    // Đảm bảo ảnh đại diện luôn có giá trị
    const users = rows.map((u) => ({
      ...u,
      hinhanh: u.hinhanh || "/images/default-avatar.jpg",
    }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}