"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Clock, Ban } from "lucide-react";
import StatCard from "@/components/StatCard";
import OrdersTable from "@/components/OrdersTable";

const iconMap = {
  ShoppingBag,
  CheckCircle,
  Clock,
  Ban,
};

const OrdersPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/donhang/stats");
        const data = await res.json();
        console.log("Thống kê:", data); // Kiểm tra dữ liệu
        setStats(data);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê đơn hàng:", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { name: "Tổng đơn", value: stats.total, icon: "ShoppingBag" },
        { name: "Đã giao hàng", value: stats.completed, icon: "CheckCircle" },
        { name: "Chờ giao hàng", value: stats.pending, icon: "Clock" },
        { name: "Đã hủy đơn", value: stats.canceled, icon: "Ban" },
      ]
    : [];

  return (
    <div className="flex-1 relative overflow-auto z-10">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {statCards.map(({ name, value, icon }) => {
            const IconComponent = iconMap[icon];
            return (
              <StatCard key={name} name={name} icon={IconComponent} value={value} />
            );
          })}
        </motion.div>

        <OrdersTable />
      </main>
    </div>
  );
};

export default OrdersPage;