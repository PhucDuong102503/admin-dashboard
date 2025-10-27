"use client";

import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
      className="bg-[#1e1e1e] border border-[#2f2f2f] rounded-xl p-6 shadow-md transition-all min-h-[120px]"
    >
      <div className="flex items-center text-sm font-medium text-gray-300 mb-2">
        <Icon size={20} className="mr-2" />
        {name}
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
    </motion.div>
  );
};

export default StatCard;