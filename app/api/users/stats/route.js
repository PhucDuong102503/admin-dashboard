import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function GET() {
  try {
    // Tổng số người dùng
    const [totalRows] = await pool.query("SELECT COUNT(*) AS total FROM user");

    // Người dùng mới (trong 30 ngày gần nhất)
    const [newRows] = await pool.query(`
      SELECT COUNT(*) AS newClients
      FROM user
      WHERE ngaytao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Người dùng đang hoạt động (chưa bị banned)
    const [activeRows] = await pool.query(`
      SELECT COUNT(*) AS activeClients
      FROM user
      WHERE banned = 0
    `);

    // Người dùng quay lại (tạo hơn 60 ngày trước và chưa bị banned)
    const [returningRows] = await pool.query(`
      SELECT COUNT(*) AS returningClients
      FROM user
      WHERE ngaytao < DATE_SUB(NOW(), INTERVAL 60 DAY)
        AND banned = 0
    `);

    return NextResponse.json({
      success: true,
      stats: {
        total: totalRows[0].total,
        newClients: newRows[0].newClients,
        activeClients: activeRows[0].activeClients,
        returningClients: returningRows[0].returningClients,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi API /users/stats:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}