// app/api/users/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.hoten,
        u.email,
        u.sodienthoai,
        u.diachi,
        u.role_id,
        r.tenrole AS tenrole,   
        CAST(u.banned AS UNSIGNED) AS banned
      FROM thoitrang.\`user\` u
      LEFT JOIN thoitrang.\`role\` r ON u.role_id = r.id
      ORDER BY u.id DESC
    `);

    // banned là số 0/1
    const users = rows.map((u) => ({
      ...u,
      banned: Number(u.banned) || 0,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách users:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi lấy danh sách users" },
      { status: 500 }
    );
  }
}
