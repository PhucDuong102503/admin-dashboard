import { NextResponse } from "next/server";
import pool from "@/lib/connect";

// Ngưỡng sắp hết hàng, bạn có thể thay đổi
const LOW_STOCK_THRESHOLD = 5;

export async function GET(req) {
  try {
    // ⭐ Sửa câu lệnh SQL: Thêm 'sp.giasanpham' vào đây
    const query = `
      SELECT
        sp.id AS sanpham_id,
        sp.tensanpham,
        sp.hinhanhsanpham,
        sp.giasanpham,
        sz.id AS size_id,
        sz.tensize,
        sps.soluong AS so_luong_ton
      FROM
        sanpham_size AS sps
      JOIN
        sanpham AS sp ON sps.sanpham_id = sp.id
      JOIN
        size AS sz ON sps.size_id = sz.id
      WHERE
        sps.soluong < ?
      ORDER BY
        sps.soluong ASC, sp.tensanpham ASC;
    `;

    const [rows] = await pool.query(query, [LOW_STOCK_THRESHOLD]);
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thống kê:", error);
    return NextResponse.json({ error: "Lỗi từ phía server." }, { status: 500 });
  }
}
