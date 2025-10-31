"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setStatus("Đang gửi mã OTP...");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setStatus(data.message || "Không có phản hồi từ server");

      if (data.success) {
        localStorage.setItem("otp_email", email);
        router.push("/verify-otp");
      }
    } catch (err) {
      console.error("Lỗi khi gửi OTP:", err);
      setStatus("Lỗi khi gửi OTP");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleSendOTP}
        className="bg-[#1e293b] p-8 rounded-lg shadow-md w-[320px]"
      >
        <h2 className="text-white text-lg mb-4 text-center font-semibold">
          Xác thực email
        </h2>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] text-white border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Gửi mã OTP
        </button>
        {status && (
          <div className="text-gray-300 text-sm text-center mt-3">{status}</div>
        )}
      </form>
    </div>
  );
}
