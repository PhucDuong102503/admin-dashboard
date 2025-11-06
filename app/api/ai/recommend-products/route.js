import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { suggestions: ["Vui lòng nhập nội dung hợp lệ."] },
        { status: 400 }
      );
    }

    // Tách từ khóa từ nội dung người dùng nhập
    const keyword = query.toLowerCase().includes("giày")
      ? "Giày"
      : query.toLowerCase().includes("áo")
      ? "Áo"
      : query.toLowerCase().includes("túi")
      ? "Túi"
      : null;

    if (!keyword) {
      return NextResponse.json({
        suggestions: [
          "Tôi chưa hiểu rõ bạn muốn tìm gì. Bạn có thể thử hỏi về giày, áo hoặc túi nhé!",
        ],
      });
    }

    // Truy vấn sản phẩm bán chạy theo loại
    const [rows] = await pool.execute(
      `
      SELECT 
        sanpham.tensanpham, 
        loaisanpham.tenloaisanpham, 
        COUNT(*) AS sold
      FROM thoitrang.chitietdonhang
      JOIN thoitrang.donhang ON donhang.id = chitietdonhang.donhang_id
      JOIN thoitrang.sanpham ON sanpham.id = chitietdonhang.sanpham_id
      JOIN thoitrang.loaisanpham ON sanpham.idloaisanpham = loaisanpham.id
      WHERE donhang.trangthai = 'Đã giao hàng'
        AND loaisanpham.tenloaisanpham LIKE ?
      GROUP BY sanpham.id, sanpham.tensanpham, loaisanpham.tenloaisanpham
      ORDER BY sold DESC
      LIMIT 3
    `,
      [`%${keyword}%`]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        suggestions: [
          `Hiện chưa có sản phẩm "${keyword}" nào bán chạy để gợi ý.`,
        ],
      });
    }

    const suggestions = rows.map(
      (r) =>
        `Sản phẩm "${r.tensanpham}" thuộc loại "${r.tenloaisanpham}" đang bán rất chạy. Bạn nên xem thử nhé!`
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Lỗi AI gợi ý sản phẩm:", error.message);
    return NextResponse.json(
      { suggestions: ["Không thể phân tích dữ liệu hiện tại."] },
      { status: 500 }
    );
  }
}
