import { NextResponse } from "next/server";
import pool from "@/lib/connect";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";

/**
 * Cập nhật sản phẩm (PUT)
 */
export async function PUT(req, context) {
  try {
    const params = await context.params; // ✅ unwrap Promise
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "";
    let tensanpham = "",
      giasanpham = 0,
      motasanpham = "",
      idloaisanpham = "",
      sizesRaw = [];
    let hinhanhsanpham = "";

    // Nếu là multipart/form-data (có thể có ảnh)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      tensanpham = formData.get("tensanpham") || "";
      giasanpham = formData.get("giasanpham") || 0;
      motasanpham = formData.get("motasanpham") || "";
      idloaisanpham = formData.get("idloaisanpham") || "";
      sizesRaw = formData.get("sizes") || "[]";

      const file = formData.get("file");
      if (file && typeof file === "object" && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir))
          fs.mkdirSync(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        hinhanhsanpham = `/uploads/${fileName}`;
      }
    } else {
      // Nếu là JSON
      const body = await req.json();
      tensanpham = body.tensanpham || "";
      giasanpham = body.giasanpham || 0;
      motasanpham = body.motasanpham || "";
      idloaisanpham = body.idloaisanpham || "";
      sizesRaw = body.sizes || [];
      hinhanhsanpham = body.hinhanhsanpham || "";
    }

    // Cập nhật sản phẩm
    const updateQuery = hinhanhsanpham
      ? `UPDATE thoitrang.sanpham SET tensanpham=?, giasanpham=?, motasanpham=?, idloaisanpham=?, hinhanhsanpham=? WHERE id=?`
      : `UPDATE thoitrang.sanpham SET tensanpham=?, giasanpham=?, motasanpham=?, idloaisanpham=? WHERE id=?`;

    const updateParams = hinhanhsanpham
      ? [tensanpham, giasanpham, motasanpham, idloaisanpham, hinhanhsanpham, id]
      : [tensanpham, giasanpham, motasanpham, idloaisanpham, id];

    await pool.execute(updateQuery, updateParams);

    // Xử lý danh sách size
    let sizes = [];
    if (typeof sizesRaw === "string") {
      try {
        sizes = JSON.parse(sizesRaw);
      } catch {
        sizes = [];
      }
    } else if (Array.isArray(sizesRaw)) {
      sizes = sizesRaw;
    }

    const [oldSizes] = await pool.execute(
      `SELECT s.tensize, spz.soluong
       FROM thoitrang.sanpham_size spz
       JOIN thoitrang.size s ON s.id = spz.size_id
       WHERE spz.sanpham_id = ?`,
      [id]
    );

    const oldSizeLabels = oldSizes.map((s) => s.tensize);
    const newSizeLabels = sizes.map((s) => s.size);

    // Xóa size không còn trong danh sách mới
    for (const old of oldSizes) {
      if (!newSizeLabels.includes(old.tensize)) {
        await pool.execute(
          `DELETE spz FROM thoitrang.sanpham_size spz
           JOIN thoitrang.size s ON s.id = spz.size_id
           WHERE spz.sanpham_id = ? AND s.tensize = ?`,
          [id, old.tensize]
        );
      }
    }

    // Thêm hoặc cập nhật size mới
    for (const s of sizes) {
      const sizeLabel = String(s.size || "").trim();
      const qty = Number(s.quantity || 0);
      if (!sizeLabel) continue;

      const [rows] = await pool.execute(
        `SELECT id FROM thoitrang.size WHERE tensize=? LIMIT 1`,
        [sizeLabel]
      );

      if (rows.length > 0) {
        const sizeId = rows[0].id;
        await pool.execute(
          `INSERT INTO thoitrang.sanpham_size (sanpham_id, size_id, soluong)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE soluong=?`,
          [id, sizeId, qty, qty]
        );
      } else {
        console.warn(`⚠️ Không tìm thấy size '${sizeLabel}' trong bảng size`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    return NextResponse.json(
      { error: "Lưu thất bại", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Xóa sản phẩm (DELETE)
 */
export async function DELETE(req, context) {
  try {
    const params = await context.params; // ✅ unwrap Promise
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT hinhanhsanpham FROM thoitrang.sanpham WHERE id=?`,
      [id]
    );

    if (rows.length > 0) {
      const filePath = path.join(
        process.cwd(),
        "public",
        rows[0].hinhanhsanpham || ""
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.execute(`DELETE FROM thoitrang.sanpham WHERE id=?`, [id]);

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm", details: error.message },
      { status: 500 }
    );
  }
}
