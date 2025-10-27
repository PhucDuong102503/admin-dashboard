"use client";

import React, { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import { DollarSign, ShoppingBag, SquareActivity, Users } from "lucide-react";
import { motion } from "framer-motion";
import SalesOverviewChart from "@/components/SalesOverviewChart";
import CategoryDistributionChart from "@/components/CategoryDistributionChart";
import OrderDistributionChart from "@/components/OrderDistributionChart";
import ProductPerformanceChart from "@/components/ProductPerformanceChart";

const OverviewPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/overview/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê tổng quan:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {stats ? (
          <>
            <StatCard
              name="Total Sales"
              icon={DollarSign}
              value={`₫${stats.totalSales?.toLocaleString("vi-VN")}`}
            />
            <StatCard
              name="Total Clients"
              icon={Users}
              value={stats.totalClients}
            />
            <StatCard
              name="Total Products"
              icon={ShoppingBag}
              value={stats.totalProducts}
            />
            <StatCard
              name="Stock"
              icon={SquareActivity}
              value={stats.stock}
            />
          </>
        ) : (
          <>
            <StatCard name="Total Sales" icon={DollarSign} value="..." />
            <StatCard name="Total Clients" icon={Users} value="..." />
            <StatCard name="Total Products" icon={ShoppingBag} value="..." />
            <StatCard name="Stock" icon={SquareActivity} value="..." />
          </>
        )}
      </motion.div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SalesOverviewChart />
        <CategoryDistributionChart />
        <OrderDistributionChart />
        <ProductPerformanceChart />
      </div>
    </main>
  );
};

export default OverviewPage;