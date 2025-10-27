"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#FF6B6B", "#4D96FF", "#FFD166", "#06D6A0", "#A29BFE"];

const CategoryDistributionChart = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [isSmallOrMediumScreen, setIsSmallOrMediumScreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await fetch("/api/overview/categories");
        const data = await res.json();

        // ✅ Loại bỏ mục "Trang chủ" và các mục có value = 0
        const filtered = data.filter(
          (item) => item.name !== "Trang chủ" && item.value > 0
        );

        setCategoryData(filtered);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu phân loại:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallOrMediumScreen(window.innerWidth <= 768);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const outerRadius = isSmallOrMediumScreen ? 60 : 80;

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
        Category Distribution
      </h2>

      <div className="h-64 md:h-80">
        {loading ? (
          <p className="text-gray-400 text-sm text-center">Đang tải dữ liệu...</p>
        ) : categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={outerRadius}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4b5563",
                  borderRadius: "8px",
                  padding: "8px",
                  fontSize: "12px"
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />
              <Legend
                iconType="circle"
                layout="horizontal"
                align="center"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center">Không có dữ liệu để hiển thị.</p>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryDistributionChart;