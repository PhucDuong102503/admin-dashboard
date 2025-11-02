"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import SalesOverviewChart from "@/components/SalesOverviewChart";
import CategoryDistributionChart from "@/components/CategoryDistributionChart";

const SalesPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageOrderValue: "0.00",
    totalSales: 0,
    totalGrowth: "0%",
    salesOverview: [],
    categoryDistribution: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sales/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalRevenue: data.totalRevenue ?? 0,
          averageOrderValue: data.averageOrderValue ?? "0.00",
          totalSales: data.totalSales ?? 0,
          totalGrowth: data.totalGrowth ?? "0%",
          salesOverview: data.salesOverview ?? [],
          categoryDistribution: data.categoryDistribution ?? [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch dữ liệu:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium">Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <StatCard
            name="Total Revenue (Month)"
            icon={DollarSign}
            value={`${Number(stats.totalRevenue).toLocaleString("vi-VN")} ₫`}
          />

          <StatCard
            name="Avg. Order Value (Month)"
            icon={ShoppingCart}
            value={`${Number(stats.averageOrderValue).toLocaleString(
              "vi-VN"
            )} ₫`}
          />

          <StatCard
            name="Total Sales (Month)"
            icon={CreditCard}
            value={`${stats.totalSales} sản phẩm`}
          />

          <StatCard
            name="Total Growth (Month)"
            icon={TrendingUp}
            value={stats.totalGrowth}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesOverviewChart data={stats.salesOverview} />
          <CategoryDistributionChart data={stats.categoryDistribution} />
        </div>
      </main>
    </div>
  );
};

export default SalesPage;
