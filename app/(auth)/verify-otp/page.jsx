"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("otp_email");
    if (!storedEmail) router.push("/forgot-password");
    else setEmail(storedEmail);
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus("Đang xác minh...");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    setStatus(data.message);

    if (data.success) {
      router.push("/reset-password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleVerify}
        className="bg-[#1e293b] p-8 rounded-lg shadow-md w-[320px]"
      >
        <h2 className="text-white text-lg mb-4 text-center font-semibold">
          Nhập mã OTP
        </h2>
        <input
          type="text"
          placeholder="Mã OTP"
          className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] text-white border border-gray-600"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Xác minh
        </button>
        {status && (
          <div className="text-gray-300 text-sm text-center mt-3">{status}</div>
        )}
      </form>
    </div>
  );
}
