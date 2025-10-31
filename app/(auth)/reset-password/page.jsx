"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("otp_email");
    if (!storedEmail) router.push("/forgot-password");
    else setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Đang cập nhật mật khẩu...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setStatus(data.message);

      if (data.success) {
        localStorage.removeItem("otp_email");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      console.error("Lỗi đặt lại mật khẩu:", err);
      setStatus("Lỗi khi cập nhật mật khẩu");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] p-8 rounded-lg shadow-md w-[320px]"
      >
        <h2 className="text-white text-lg mb-4 text-center font-semibold">
          Đặt lại mật khẩu
        </h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] text-white border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Đặt lại
        </button>

        {status && (
          <div className="text-gray-300 text-sm text-center mt-3">{status}</div>
        )}
      </form>
    </div>
  );
}
