"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import {
  RotateCcw,
  UserCheck,
  UserPlus,
  UsersIcon,
} from "lucide-react";
import UsersTable from "@/components/UsersTable";

const UsersPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    newClients: 0,
    activeClients: 0,
    returningClients: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/users/stats");
        const data = await res.json();

        if (res.ok && data.success) {
          setStats(data.stats);
        } else {
          console.error("Lỗi khi lấy thống kê:", data.message);
        }
      } catch (error) {
        console.error("❌ Lỗi kết nối API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          <StatCard
            name="Total Clients"
            icon={UsersIcon}
            value={loading ? "..." : stats.total.toLocaleString()}
          />
          <StatCard
            name="New Clients"
            icon={UserPlus}
            value={loading ? "..." : stats.newClients.toLocaleString()}
          />
          <StatCard
            name="Active Clients"
            icon={UserCheck}
            value={loading ? "..." : stats.activeClients.toLocaleString()}
          />
          <StatCard
            name="Returning Clients"
            icon={RotateCcw}
            value={loading ? "..." : stats.returningClients.toLocaleString()}
          />
        </motion.div>

        <UsersTable />
      </main>
    </div>
  );
};

export default UsersPage;