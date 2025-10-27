"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from "recharts";

const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const res = await fetch("/api/overview/sales");
        const data = await res.json();

        // Format dữ liệu để khớp với biểu đồ
        const formatted = data.map((item) => ({
          name: item.month, // tháng
          sales: Number(item.sales), // ép kiểu về số
        }));

        setSalesData(formatted);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu doanh thu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div className="bg-[#1e1e1e] border border-[#2f2f2f] rounded-xl p-6 shadow-md">
      <h2 className="text-lg font-semibold text-white mb-4">Sales Overview</h2>

      <div className="h-64 md:h-80">
        {!loading && salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
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
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#9c27b0"
                strokeWidth={3}
                dot={{ fill: "#9c27b0", stroke: "#9c27b0" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm">
            {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu để hiển thị."}
          </p>
        )}
      </div>
    </div>
  );
};

export default SalesOverviewChart;