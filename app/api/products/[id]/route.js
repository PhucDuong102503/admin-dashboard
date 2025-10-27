import pool from "@/lib/connect";

// 🟢 PUT - Cập nhật sản phẩm
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const tensanpham = formData.get('tensanpham') || '';
    const giasanpham = formData.get('giasanpham') || '';
    const motasanpham = formData.get('motasanpham') || '';
    const idloaisanpham = formData.get('idloaisanpham') || '';
    let hinhanhsanpham = formData.get('hinhanhsanpham') || '';

    const file = formData.get('file'); // nếu có file mới upload
    // if (file && typeof file === 'object' && file.name) {
    //   const bytes = await file.arrayBuffer();
    //   const buffer = Buffer.from(bytes);
    //   const fileName = `${Date.now()}-${file.name}`;
    //   const filePath = path.join(process.cwd(), 'public/uploads', fileName);
    //   await writeFile(filePath, buffer);
    //   hinhanhsanpham = `/uploads/${fileName}`;
    // }

    // ⚙️ Cập nhật DB
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
