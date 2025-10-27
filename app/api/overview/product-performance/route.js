import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        sp.tensanpham AS name,
        SUM(ctdh.soluong) AS Retention,
        SUM(ctdh.gia * ctdh.soluong) AS Revenue,
        SUM((ctdh.gia - IFNULL(cpn.gianhap, 0)) * ctdh.soluong) AS Profit
      FROM thoitrang.chitietdonhang ctdh
      JOIN thoitrang.sanpham sp ON sp.id = ctdh.sanpham_id
      LEFT JOIN (
        SELECT sanpham_id, AVG(gianhap) AS gianhap
        FROM thoitrang.chitietphieunhap
        GROUP BY sanpham_id
      ) cpn ON cpn.sanpham_id = sp.id
      GROUP BY sp.id, sp.tensanpham
      ORDER BY Revenue DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hiệu suất sản phẩm:", error.message);
    return Response.json({ error: "Không thể lấy dữ liệu hiệu suất sản phẩm" }, { status: 500 });
  }
}