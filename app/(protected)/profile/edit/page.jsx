"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
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
          if (data.success) {
            setUser(data.user);
            setPreview(data.user.hinhanh || "/images/admin.jpg");
          }
        });
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id);

    const res = await fetch("/api/profile/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      const updatedUser = { ...user, hinhanh: data.url };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPreview(data.url);
      alert("✅ Đổi ảnh thành công!");
    } else {
      alert("❌ Upload thất bại");
    }
  };

  if (!user) return <p className="text-white text-center mt-10">Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-[#1e1e1e] text-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thông tin</h2>
      <div className="flex items-center space-x-6">
        <Image
          src={preview.startsWith("/") ? preview : `/${preview}`}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-white" />
      </div>

      <div className="mt-6">
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Đổi ảnh đại diện
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}