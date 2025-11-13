import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function POST(req) {
  try {
    const { sanpham_id, size_id, so_luong_nhap } = await req.json();

    if (!sanpham_id || !size_id || !so_luong_nhap || so_luong_nhap <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        },
        { status: 400 }
      );
    }

    const query = `
      UPDATE sanpham_size
      SET soluong = soluong + ?
      WHERE sanpham_id = ? AND size_id = ?;
    `;

    const [result] = await pool.query(query, [
      so_luong_nhap,
      sanpham_id,
      size_id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy sản phẩm để cập nhật. Có thể đã bị xóa.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Nhập hàng thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xử lý nhập hàng:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi từ phía server." },
      { status: 500 }
    );
  }
}
