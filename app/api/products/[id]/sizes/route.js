// app/api/products/[id]/sizes/route.js
import pool from "@/lib/connect";

export async function GET(req, context) {
  try {
    const { params } = await context;
    const id = params?.id;
    if (!id) return Response.json({ success: false, message: "Missing id" }, { status: 400 });

    // Lấy danh sách size với soluong cho sản phẩm
    const [rows] = await pool.execute(
      `SELECT s.tensize AS size, COALESCE(ss.soluong,0) AS quantity, s.id AS size_id
       FROM thoitrang.size s
       LEFT JOIN thoitrang.sanpham_size ss
         ON ss.size_id = s.id AND ss.sanpham_id = ?
       ORDER BY s.id ASC`,
      [id]
    );

    return Response.json({ success: true, sizes: rows });
  } catch (err) {
    console.error("GET /api/products/[id]/sizes error:", err);
    return Response.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
