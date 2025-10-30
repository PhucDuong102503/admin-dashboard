import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// ✅ Hàm kết nối MySQL
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "thoitrang",
  });
}

// ✅ Lấy user theo ID (GET /api/users/[id])
export async function GET(req, contextPromise) {
  const context = await contextPromise;
  const { id } = await context?.params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Thiếu ID người dùng" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();

    // ✅ Sửa phần truy vấn ở đây: JOIN với bảng role để lấy tên vai trò
    const [rows] = await connection.execute(
      `SELECT user.*, role.tenrole
       FROM user
       LEFT JOIN role ON user.role_id = role.id
       WHERE user.id = ?`,
      [id]
    );

    await connection.end();

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ GET /api/users/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ✅ Cập nhật user (PATCH /api/users/[id])
export async function PATCH(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Thiếu ID người dùng" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    let { name, email, phone, role_id, address, banned } = body;

    const connection = await getConnection();
    let result;

    if (banned !== undefined) {
      // ✅ Cập nhật trạng thái bị cấm (banned)
      const [resp] = await connection.execute(
        `UPDATE user 
         SET banned = ?
         WHERE id = ?`,
        [!!banned, id]
      );
      result = resp;
    } else {
      // ✅ Cập nhật thông tin user và role (kiểm tra role_id hợp lệ)
      const [resp] = await connection.execute(
        `UPDATE user 
         SET hoten = ?, 
             email = ?, 
             sodienthoai = ?, 
             role_id = (SELECT id FROM role WHERE id = ? LIMIT 1), 
             diachi = ?
         WHERE id = ?`,
        [name, email, phone, role_id, address, id]
      );
      result = resp;
    }

    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật người dùng thành công",
    });
  } catch (err) {
    console.error("❌ PATCH /api/users/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ✅ Xóa user (DELETE /api/users/[id])
export async function DELETE(req, contextPromise) {
  const context = await contextPromise;
  const { id } = await context?.params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Thiếu ID người dùng" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    const [result] = await connection.execute("DELETE FROM user WHERE id = ?", [
      id,
    ]);
    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa người dùng thành công",
    });
  } catch (err) {
    console.error("❌ DELETE /api/users/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
