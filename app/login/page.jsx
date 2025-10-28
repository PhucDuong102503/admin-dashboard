"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/overview");
    } else {
      const data = await res.json();
      setError(data.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleLogin}
        className="bg-[#1e293b] p-8 rounded-lg shadow-md w-[320px]"
      >
        <h2 className="text-white text-lg mb-4 text-center font-semibold">
          Đăng nhập quản trị
        </h2>

        {error && (
          <div className="text-red-400 text-sm text-center mb-2">{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] text-white border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] text-white border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
