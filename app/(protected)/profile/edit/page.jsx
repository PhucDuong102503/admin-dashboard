"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    hoten: "",
    email: "",
    sodienthoai: "",
    diachi: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const { id } = JSON.parse(stored);
    fetch("/api/profile/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setForm({
            hoten: data.user.hoten || "",
            email: data.user.email || "",
            sodienthoai: data.user.sodienthoai || "",
            diachi: data.user.diachi || "",
          });
          setPreview(data.user.hinhanh);
        }
      });
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !user?.id) return;

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

      window.dispatchEvent(new Event("userUpdated"));

      alert("✅ Đổi ảnh thành công!");
    } else {
      alert("❌ Upload thất bại");
    }
  };

  const handleSaveInfo = async () => {
    if (!user?.id) return;

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...form }),
    });

    const data = await res.json();
    if (data.success) {
      const updatedUser = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      setUser(updatedUser);
      alert("✅ Cập nhật thông tin thành công!");
    } else {
      alert("❌ Cập nhật thất bại");
    }
  };

  if (!user) return <p className="text-white text-center mt-10">Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-[#1e1e1e] text-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thông tin</h2>

      <div className="flex items-center space-x-6">
        {preview && (
          <Image
            src={preview}
            alt="Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-white"
        />
      </div>

      <div className="mt-6 space-y-4">
        {[
          { label: "Họ tên", key: "hoten" },
          { label: "Email", key: "email" },
          { label: "Số điện thoại", key: "sodienthoai" },
          { label: "Địa chỉ", key: "diachi" },
        ].map(({ label, key }) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="bg-[#2f2f2f] text-white border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Đổi ảnh đại diện
        </button>
        <button
          onClick={handleSaveInfo}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Lưu thông tin
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}