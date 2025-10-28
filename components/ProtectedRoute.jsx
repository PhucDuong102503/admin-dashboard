"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Kiểm tra login trong localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      router.push("/login"); // 🔒 Chuyển hướng nếu chưa login
    } else {
      setIsLoading(false); // ✅ Đã login → render nội dung
    }
  }, [router]);

  // ⏳ Loading UI khi kiểm tra
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }

  // ✅ Trả về nội dung của page/component
  return <>{children}</>;
};

export default ProtectedRoute;
