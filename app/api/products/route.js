import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM thoitrang.sanpham) AS totalProducts,
        (SELECT SUM(soluong) FROM thoitrang.sanpham_size) AS totalStock,
        (SELECT SUM(soluong) FROM thoitrang.chitietdonhang) AS totalSold,
        (SELECT COUNT(*) FROM thoitrang.loaisanpham) AS totalCategories
    `);

    return Response.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thống kê sản phẩm:", error.message);
    return Response.json({ error: "Không thể lấy dữ liệu sản phẩm" }, { status: 500 });
  }
}