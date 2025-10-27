import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        lsp.tenloaisanpham AS name,
        COUNT(sp.id) AS value
      FROM thoitrang.loaisanpham lsp
      LEFT JOIN thoitrang.sanpham sp ON sp.idloaisanpham = lsp.id
      GROUP BY lsp.id, lsp.tenloaisanpham
      ORDER BY value DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu phân loại:", error.message);
    return Response.json({ error: "Không thể lấy dữ liệu phân loại" }, { status: 500 });
  }
}