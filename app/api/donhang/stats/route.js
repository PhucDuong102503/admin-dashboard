import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN trangthai = 'Đã giao hàng' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN trangthai = 'Chờ giao hàng' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN trangthai = 'Đã hủy đơn' THEN 1 ELSE 0 END) AS canceled
      FROM donhang
    `);

    return Response.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error.message);
    return Response.json({ error: "Không thể lấy thống kê" }, { status: 500 });
  }
}