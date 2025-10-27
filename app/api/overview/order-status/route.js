import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        trangthai AS name,
        COUNT(*) AS value
      FROM thoitrang.donhang
      GROUP BY trangthai
      ORDER BY value DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu trạng thái đơn hàng:", error.message);
    return Response.json({ error: "Không thể lấy dữ liệu trạng thái đơn hàng" }, { status: 500 });
  }
}