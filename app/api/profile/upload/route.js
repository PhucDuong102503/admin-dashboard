import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar");
    const userId = formData.get("userId");

    if (!file || typeof file === "string" || !userId) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `avatar-${userId}-${timestamp}.${ext}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    await pool.query("UPDATE user SET hinhanh = ? WHERE id = ?", [
      imageUrl,
      userId,
    ]);

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("❌ Lỗi upload ảnh:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}
