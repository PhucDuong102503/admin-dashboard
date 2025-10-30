import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
    DATE_FORMAT(ngaydathang, '%Y-%m') AS month,
    SUM(tongtien) AS sales
  FROM thoitrang.donhang
  WHERE trangthai = 'Đã giao hàng'
  GROUP BY month
  ORDER BY month ASC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error.message);
    return Response.json({ error: "Không thể lấy dữ liệu doanh thu" }, { status: 500 });
  }
}