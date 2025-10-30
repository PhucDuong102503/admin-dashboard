"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const { id } = JSON.parse(stored);
      fetch("/api/profile/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUser(data.user);
        });
    }
  }, []);

  if (!user) return <p className="text-white text-center mt-10">Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-[#1e1e1e] text-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>
      <div className="flex items-center space-x-6">
        <Image
          src={user.hinhanh}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <p><strong>Họ tên:</strong> {user.hoten}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>SĐT:</strong> {user.sodienthoai}</p>
          <p><strong>Địa chỉ:</strong> {user.diachi}</p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push("/profile/edit")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
}