import { promises as fs } from "fs";
import path from "path";

const settingsFile = path.join(process.cwd(), "data", "settings.json");

// GET - lấy dữ liệu cấu hình
export async function GET() {
  try {
    const data = await fs.readFile(settingsFile, "utf8");
    return new Response(data, { status: 200 });
  } catch (err) {
    console.error("Lỗi đọc settings:", err);
    return new Response(JSON.stringify({ theme: "dark" }), { status: 200 });
  }
}

// POST - lưu thay đổi vào file settings.json
export async function POST(req) {
  try {
    const body = await req.json();
    await fs.writeFile(settingsFile, JSON.stringify(body, null, 2));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Lỗi ghi settings:", err);
    return new Response(JSON.stringify({ error: "Ghi thất bại" }), {
      status: 500,
    });
  }
}
