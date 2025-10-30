"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import vn from "../public/vn.png";
import admin from "../public/images/admin.jpg";
import { Bell, LogOut, Settings, User } from "lucide-react";


export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // ✅ State để lưu số thông báo chưa đọc
  const [unreadCount, setUnreadCount] = useState(0);

const fetchUnreadNotifications = async () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;
  const { id } = JSON.parse(storedUser);

  const res = await fetch(`/api/notifications/unread?admin_id=${id}`);
  const data = await res.json();
  if (data.success) setUnreadCount(data.total);
};

  const [userInfo, setUserInfo] = useState({});

  // ✅ Hàm load thông tin user
  const loadUserInfo = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserInfo({
        hoten: parsed.hoten,
        hinhanh: parsed.hinhanh,
      });
    }
  };

  // ✅ Lắng nghe cả thay đổi localStorage và sự kiện userUpdated
  useEffect(() => {
  loadUserInfo();
  fetchUnreadNotifications();

  const handleUpdate = () => {
    loadUserInfo();
    fetchUnreadNotifications();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener("userUpdated", handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener("userUpdated", handleUpdate);
  };
}, []);

  // ✅ Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="w-full mt-6 relative">
      <div className="max-w-7xl mx-auto bg-[#1e1e1e] border border-[#2f2f2f] shadow-md rounded-xl px-6 py-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>

        {/* Phần bên phải */}
        <div className="flex items-center space-x-4 relative" ref={menuRef}>
          <Image
            src={vn}
            alt="VN"
            width={25}
            height={18}
            className="rounded-full"
          />
          
          <div className="relative">
  <Bell
    className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer"
    onClick={() => router.push("/notifications")}
  />
  {unreadCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
      {unreadCount}
    </span>
  )}
</div>

          {/* Avatar + Tên Admin */}
          <div
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <Image
              src={userInfo.hinhanh}
              alt="Avatar"
              width={35}
              height={35}
              className="rounded-full"
              unoptimized // nếu ảnh từ URL ngoài
            />
            <span className="hidden sm:block font-medium text-white">
              {userInfo.hoten}
            </span>
          </div>

          {/* Dropdown menu */}
          {openMenu && (
            <div className="absolute right-0 top-14 w-48 bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg shadow-lg py-2 z-50 animate-fade-in">
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2f2f2f] transition"
              >
                <User size={16} className="mr-2" /> Profile
              </button>

              <button
                onClick={() => router.push("/setting")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2f2f2f] transition"
              >
                <Settings size={16} className="mr-2" /> Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-[#2f2f2f] transition"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hiệu ứng animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
