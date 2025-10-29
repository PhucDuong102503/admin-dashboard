// app/api/products/create/route.js
import pool from "@/lib/connect";
import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const tensanpham = formData.get("tensanpham") || "";
    const giasanpham = formData.get("giasanpham") || 0;
    const motasanpham = formData.get("motasanpham") || "";
    const idloaisanpham = formData.get("idloaisanpham") || "";
    const sizesRaw = formData.get("sizes") || "[]";
    let hinhanhsanpham = "";

    const file = formData.get("file");
    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
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

    // process sizes JSON (array of { size: "S" | "37", quantity: number })
    let sizes = [];
    try { sizes = JSON.parse(sizesRaw); } catch (e) { sizes = []; }

    for (const s of sizes) {
      const sizeLabel = String(s.size || "").trim();
      const qty = Number(s.quantity || 0);

      if (!sizeLabel) continue;

      // find size id
      const [rows] = await pool.execute(`SELECT id FROM thoitrang.size WHERE tensize = ? LIMIT 1`, [sizeLabel]);
      if (rows.length > 0) {
        const sizeId = rows[0].id;
        // insert into sanpham_size (use INSERT IGNORE or ON DUPLICATE)
        await pool.execute(
          `INSERT INTO thoitrang.sanpham_size (sanpham_id, size_id, soluong)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE soluong = ?`,
          [insertedId, sizeId, qty, qty]
        );
      } else {
        // nếu không tìm thấy tensize, bỏ qua (bảng size của bạn đã có dữ liệu chuẩn)
        console.warn("Size not found:", sizeLabel);
      }
    }

    return Response.json({ success: true, id: insertedId });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    return Response.json({ error: "Thêm sản phẩm thất bại" }, { status: 500 });
  }
}
