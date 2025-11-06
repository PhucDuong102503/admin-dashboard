import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { reply: "Vui lòng nhập nội dung hợp lệ." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY || "AIzaSyAbrZIrqWaaNbZz0J9zTaL2jTvPz2AYqHo";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("❌ Lỗi từ Gemini:", data.error.message);
      return NextResponse.json(
        { reply: `Lỗi Gemini: ${data.error.message}` },
        { status: 500 }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi chưa thể phản hồi lúc này.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi hệ thống khi gọi Gemini:", err);
    return NextResponse.json(
      { reply: "Lỗi hệ thống khi gọi Gemini. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
