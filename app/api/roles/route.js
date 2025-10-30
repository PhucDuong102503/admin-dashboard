// app/api/roles/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT id, tenrole FROM thoitrang.role ORDER BY id ASC"
    );
    return NextResponse.json({ success: true, roles: rows });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách role:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi lấy danh sách role" },
      { status: 500 }
    );
  }
}
