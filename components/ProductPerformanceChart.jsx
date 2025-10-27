"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const ProductPerformanceChart = () => {
  const [productPerformanceData, setProductPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const res = await fetch("/api/overview/product-performance");
        const data = await res.json();

        // Lọc bỏ sản phẩm không có doanh thu
        const filtered = data.filter(
          (item) =>
            item.name &&
            (item.Retention > 0 || item.Revenue > 0 || item.Profit > 0)
        );

        setProductPerformanceData(filtered);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu hiệu suất sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-lg shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <h2 className="text-base md:text-xl font-semibold text-gray-100 mb-4 text-center md:text-left">
        Product Performance
      </h2>

      <div className="w-full h-64 md:h-72">
        {loading ? (
          <p className="text-gray-400 text-sm text-center">Đang tải dữ liệu...</p>
        ) : productPerformanceData.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={productPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                width={40}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4b5563",
                  fontSize: "12px"
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="Retention"
                fill="#ff7043"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Revenue"
                fill="#29b6f6"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Profit"
                fill="#66bb6a"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center">Không có dữ liệu để hiển thị.</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductPerformanceChart;