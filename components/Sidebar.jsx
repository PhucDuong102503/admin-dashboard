"use client";

import {
  LayoutDashboard,
  Package,
  Users,
  LineChart,
  ClipboardList,
  Settings,
  Mail,
  Bell,
  HelpCircle,
  Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const sidebarItems = [
  { name: "Dashboard", href: "/overview", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Clients", href: "/users", icon: Users },
  { name: "Sales", href: "/sales", icon: LineChart },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Messages", href: "/messages", icon: Mail },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Help", href: "/help", icon: HelpCircle }
];

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen bg-[#1e1e1e] text-white border-r border-[#2f2f2f] flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Nút ba gạch để thu gọn/mở rộng */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f2f2f]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-300 hover:text-white"
        >
          <Menu size={20} />
        </button>
        {!collapsed && (
          <span className="text-lg font-bold">Fashion Shop</span>
        )}
      </div>

      {/* Menu */}
      <nav className="mt-4 space-y-2 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-[#2f2f2f]" : "hover:bg-[#2f2f2f]"
                }`}
              >
                <Icon size={20} className="min-w-[20px]" />
                {!collapsed && (
                  <span className="ml-4 whitespace-nowrap">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Icon dưới cùng */}
      <div className="mt-auto flex justify-center items-center py-6">
        <div className="w-8 h-8 rounded-full bg-[#2f2f2f] flex items-center justify-center text-sm font-bold">
          N
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;