import pool from "@/lib/connect";
import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs";

export async function POST(req) {
  // const body = await req.json();

  try {
    const formData = await req.formData();
    const tensanpham = formData.get("tensanpham") || "";
    const giasanpham = formData.get("giasanpham") || "";
    const motasanpham = formData.get("motasanpham") || "";
    const idloaisanpham = formData.get("idloaisanpham") || "";
    let hinhanhsanpham = formData.get("hinhanhsanpham") || "";

    const file = formData.get("file");
    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");
      // ✅ Tạo thư mục nếu chưa có
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      hinhanhsanpham = `/uploads/${fileName}`;
    }

    const [result] = await pool.execute(
      `INSERT INTO thoitrang.sanpham (tensanpham, giasanpham, motasanpham, idloaisanpham, hinhanhsanpham)
       VALUES (?, ?, ?, ?, ?)`,
      [tensanpham, giasanpham, motasanpham, idloaisanpham, hinhanhsanpham]
    );

    const insertedId = result.insertId;

    return Response.json({ success: true, id: insertedId });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error.message);
    return Response.json({ error: "Thêm sản phẩm thất bại" }, { status: 500 });
  }
}
