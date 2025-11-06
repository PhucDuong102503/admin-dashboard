"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AiChatWidget from "@/components/AiChatWidget";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (data.isAuthenticated) {
          setAuthorized(true);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) return null;
  if (!authorized) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto bg-white text-black">
        <Header />
        <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
          {children}
          <AiChatWidget />
        </main>
      </div>
    </div>
  );
}
