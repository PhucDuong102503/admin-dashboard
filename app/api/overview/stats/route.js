import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT SUM(tongtien) FROM thoitrang.donhang) AS totalSales,
        (SELECT COUNT(*) FROM thoitrang.user) AS totalClients,
        (SELECT COUNT(*) FROM thoitrang.sanpham) AS totalProducts,
        (SELECT SUM(soluong) FROM thoitrang.sanpham_size) AS stock
      FROM dual
    `);

    return Response.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê tổng quan:", error.message);
    return Response.json({ error: "Không thể lấy thông tin" }, { status: 500 });
  }
}