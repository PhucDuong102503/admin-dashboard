"use client";

import React from "react";
import Image from "next/image";
import vn from "../public/vn.png";
import { Bell } from "lucide-react";
import admin from "../public/images/admin.jpg";

const Header = () => {
  return (
    <header className="w-full mt-6">
      <div className="max-w-7xl mx-auto bg-[#1e1e1e] border border-[#2f2f2f] shadow-md rounded-xl px-6 py-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Image src={vn} alt="VN" width={25} height={18} className="rounded-full" />
          <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
          <div className="flex items-center space-x-2">
            <Image src={admin} alt="Admin" width={35} height={35} className="rounded-full" />
            <span className="hidden sm:block font-medium text-white">John Mark</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;