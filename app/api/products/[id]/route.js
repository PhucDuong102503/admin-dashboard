import pool from "@/lib/connect";

// 🟢 PUT - Cập nhật sản phẩm
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    console.log(body)
    const { tensanpham = '', giasanpham='', motasanpham='', idloaisanpham='', hinhanhsanpham='' } = body;

    const [result] = await pool.execute(
      `UPDATE thoitrang.sanpham
       SET tensanpham = ?, giasanpham = ?, motasanpham = ?, idloaisanpham = ?, hinhanhsanpham = ?
       WHERE id = ?`,
      [tensanpham, giasanpham, motasanpham, idloaisanpham, hinhanhsanpham, id]
    );

    if (result.affectedRows === 0)
      return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });

    return Response.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    return Response.json({ error: "Lỗi khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// 🔴 DELETE - Xóa sản phẩm
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const [result] = await pool.execute(
      `DELETE FROM thoitrang.sanpham WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0)
      return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });

    return Response.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    return Response.json({ error: "Lỗi khi xóa sản phẩm" }, { status: 500 });
  }
}
