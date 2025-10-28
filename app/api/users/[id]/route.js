import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// ✅ Hàm kết nối MySQL
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456", // ⚠️ Đổi thành mật khẩu MySQL thật của bạn
    database: "thoitrang", // ⚠️ Đổi nếu DB bạn có tên khác
  });
}

// ✅ Lấy user theo ID (GET /api/users/[id])
export async function GET(req, contextPromise) {
  const context = await contextPromise;
  const id = context?.params?.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Thiếu ID người dùng" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute("SELECT * FROM user WHERE id = ?", [
      id,
    ]);
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
export async function PATCH(req, contextPromise) {
  const context = await contextPromise;
  const id = context?.params?.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Thiếu ID người dùng" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, phone, role, status } = body;

    const connection = await getConnection();
    const [result] = await connection.execute(
      `UPDATE user 
       SET name = ?, email = ?, phone = ?, role = ?, status = ? 
       WHERE id = ?`,
      [name, email, phone, role, status, id]
    );
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
  const id = context?.params?.id;

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
