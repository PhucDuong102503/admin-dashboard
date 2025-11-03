// Đường dẫn file: app/api/messages/users/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/connect";

export async function GET(req) {
  // Thêm `req` vào đây
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.hoten,
        u.email,
        u.hinhanh
      FROM thoitrang.\`user\` u
      LEFT JOIN thoitrang.\`role\` r ON u.role_id = r.id
      WHERE r.tenrole != 'admin'
      ORDER BY u.id DESC
    `);

    // LOGIC MỚI: TẠO URL ĐẦY ĐỦ CHO HÌNH ẢNH
    // Lấy URL gốc của server (ví dụ: http://localhost:8080) một cách tự động
    // dùng URL của XAMPP/Apache chứ không phải của Next.js
    const APACHE_BASE_URL = "http://localhost/FashionShop"; // <<-- đây là URL gốc của project PHP

    const users = rows.map((user) => {
      let finalImageUrl = "/images/default-avatar.jpg"; // Ảnh mặc định

      if (user.hinhanh) {
        // Kiểm tra xem đường dẫn đã là URL đầy đủ chưa
        if (user.hinhanh.startsWith("http")) {
          finalImageUrl = user.hinhanh;
        } else {
          // Nếu là đường dẫn tương đối (ví dụ: uploads/avatar.png), hãy nối nó với URL của server Apache
          const cleanPath = user.hinhanh.startsWith("/")
            ? user.hinhanh.substring(1)
            : user.hinhanh;
          finalImageUrl = `${APACHE_BASE_URL}/${cleanPath}`;
        }
      }

      return {
        ...user,
        hinhanh: finalImageUrl, // Gán URL cuối cùng đã được xử lý
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}
