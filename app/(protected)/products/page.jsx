"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import {
  ChartBarStacked,
  DollarSign,
  ShoppingBag,
  SquareActivity,
} from "lucide-react";
import ProductsTable from "@/components/ProductsTable";

const ProductsPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("API lỗi");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err);
        setError(true);
      });
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
        {error ? (
          <p className="text-red-500 text-sm col-span-4">
            Không thể tải dữ liệu thống kê
          </p>
        ) : stats ? (
          <>
            <StatCard
              name="Total Products"
              icon={ShoppingBag}
              value={Number(stats.totalProducts).toLocaleString()}
            />
            <StatCard
              name="Total Stock"
              icon={SquareActivity}
              value={Number(stats.totalStock).toLocaleString()}
            />
            <StatCard
              name="Total Sold"
              icon={DollarSign}
              value={Number(stats.totalSold).toLocaleString()}
            />
            <StatCard
              name="Total Categories"
              icon={ChartBarStacked}
              value={Number(stats.totalCategories - 1).toLocaleString()}
/>
          </>
        ) : (
          <p className="text-gray-400 text-sm col-span-4">Đang tải dữ liệu...</p>
        )}
      </motion.div>

      <ProductsTable />
    </main>
  );
};

export default ProductsPage;