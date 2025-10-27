import pool from "@/lib/connect";

export async function POST(req) {
  const body = await req.json();

  try {
    const [result] = await pool.execute(
      `INSERT INTO thoitrang.sanpham (tensanpham, giasanpham, motasanpham, idloaisanpham, hinhanhsanpham)
       VALUES (?, ?, ?, ?, ?)`,
      [
        body.tensanpham,
        body.giasanpham,
        body.motasanpham,
        body.idloaisanpham,
        body.hinhanhsanpham,
      ]
    );

    const insertedId = result.insertId;

    return Response.json({ success: true, id: insertedId });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error.message);
    return Response.json({ error: "Thêm sản phẩm thất bại" }, { status: 500 });
  }
}