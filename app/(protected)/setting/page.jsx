"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Globe, Layout, User, RefreshCcw, Database } from "lucide-react";

const SettingsPage = () => {
  // === State lưu cấu hình ===
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("vi");
  const [dataRange, setDataRange] = useState("month");
  const [widgets, setWidgets] = useState({
    sales: true,
    category: true,
    orders: true,
    products: true,
  });
  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatar.png",
  });

  // === Tải từ localStorage ===
  useEffect(() => {
    const load = (key, defaultValue) =>
      JSON.parse(localStorage.getItem(key)) || defaultValue;
    setTheme(localStorage.getItem("theme") || "dark");
    setLanguage(localStorage.getItem("language") || "vi");
    setDataRange(localStorage.getItem("dataRange") || "month");
    setWidgets(load("widgets", widgets));
    setAdmin(load("admin", admin));
  }, []);

  // === Lưu cài đặt ===
  const handleSave = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);
    localStorage.setItem("dataRange", dataRange);
    localStorage.setItem("widgets", JSON.stringify(widgets));
    localStorage.setItem("admin", JSON.stringify(admin));
    alert("✅ Đã lưu cài đặt!");
  };

  // === Reset toàn bộ ===
  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1e1e1e] text-white p-8 rounded-xl shadow-xl border border-[#2a2a2a]"
    >
      <h2 className="text-2xl font-bold mb-6">⚙️ Cài đặt hệ thống</h2>

      {/* GIAO DIỆN */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sun className="text-yellow-400" /> Giao diện
        </h3>
        <div className="flex gap-4">
          {["light", "dark", "system"].map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`px-4 py-2 rounded-lg border ${
                theme === mode ? "bg-blue-600 border-blue-500" : "border-gray-600"
              }`}
            >
              {mode === "light" ? "🌞 Sáng" : mode === "dark" ? "🌙 Tối" : "💻 Hệ thống"}
            </button>
          ))}
        </div>
      </section>

      {/* NGÔN NGỮ */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Globe className="text-green-400" /> Ngôn ngữ
        </h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#2f2f2f] border border-gray-600 px-4 py-2 rounded-lg"
        >
          <option value="vi">🇻🇳 Tiếng Việt</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </section>

      {/* PHẠM VI DỮ LIỆU */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Database className="text-cyan-400" /> Phạm vi dữ liệu
        </h3>
        <div className="flex gap-3">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setDataRange(range)}
              className={`px-4 py-2 rounded-lg border ${
                dataRange === range ? "bg-cyan-600 border-cyan-500" : "border-gray-600"
              }`}
            >
              {range === "week" ? "Tuần này" : range === "month" ? "Tháng này" : "Năm nay"}
            </button>
          ))}
        </div>
      </section>

      {/* THÀNH PHẦN DASHBOARD */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Layout className="text-purple-400" /> Thành phần Dashboard
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(widgets).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  setWidgets((prev) => ({ ...prev, [key]: !prev[key] }))
                }
              />
              {key === "sales"
                ? "Sales Overview"
                : key === "category"
                ? "Category Distribution"
                : key === "orders"
                ? "Order Status Distribution"
                : "Product Performance"}
            </label>
          ))}
        </div>
      </section>

      {/* NÚT LƯU / RESET */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
        >
          💾 Lưu thay đổi
        </button>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Khôi phục mặc định
        </button>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
