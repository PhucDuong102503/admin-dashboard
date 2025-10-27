import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sp.id,
        sp.tensanpham,
        sp.giasanpham,
        sp.motasanpham,
        sp.idloaisanpham,
        lsp.tenloaisanpham,
        sp.hinhanhsanpham,
        COALESCE((
          SELECT SUM(sps.soluong)
          FROM thoitrang.sanpham_size sps
          WHERE sps.sanpham_id = sp.id
        ), 0) AS stock,
        COALESCE((
          SELECT SUM(ctdh.soluong)
          FROM thoitrang.chitietdonhang ctdh
          WHERE ctdh.sanpham_id = sp.id
        ), 0) AS sales
      FROM thoitrang.sanpham sp
      LEFT JOIN thoitrang.loaisanpham lsp 
        ON sp.idloaisanpham = lsp.id AND lsp.id != 1
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error.message);
    return Response.json({ error: "Không thể lấy danh sách sản phẩm" }, { status: 500 });
  }
}