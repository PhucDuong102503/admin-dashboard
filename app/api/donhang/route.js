import pool from "@/lib/connect";

export async function GET() {
  try {
    const [rows] = await pool.execute("SELECT * FROM donhang ORDER BY id DESC");
    return Response.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error.message);
    return Response.json({ error: "Không thể lấy đơn hàng" }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json();
  const { email, soluong, tongtien, ngaydat, trangthai } = body;

  if (!email || !soluong || !tongtien || !ngaydat || !trangthai) {
    return Response.json({ error: "Thiếu dữ liệu đầu vào" }, { status: 400 });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO donhang (email, soluong, tongtien, ngaydat, trangthai)
       VALUES (?, ?, ?, ?, ?)`,
      [email, soluong, tongtien, ngaydat, trangthai]
    );

    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Lỗi khi thêm đơn hàng:", error.message);
    return Response.json({ error: "Không thể thêm đơn hàng" }, { status: 500 });
  }
}

export async function PUT(req) {
  const body = await req.json();
  const { id, trangthai } = body;

  if (!id || !trangthai) {
    return Response.json({ error: "Thiếu ID hoặc trạng thái" }, { status: 400 });
  }

  try {
    await pool.execute(
      `UPDATE donhang SET trangthai = ? WHERE id = ?`,
      [trangthai, id]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn hàng:", error.message);
    return Response.json({ error: "Không thể cập nhật đơn hàng" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Thiếu ID đơn hàng" }, { status: 400 });
  }

  try {
    await pool.execute(`DELETE FROM donhang WHERE id = ?`, [id]);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng:", error.message);
    return Response.json({ error: "Không thể xóa đơn hàng" }, { status: 500 });
  }
}