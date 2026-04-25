"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/lib/authContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  // Redirect when auth resolves and user is not an admin
  useEffect(() => {
    if (loading) return;
    if (!user || userProfile?.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [loading, user, userProfile, router]);

  // Safety timeout: if still loading after 3s, redirect to login
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => router.replace("/admin/login"), 3000);
    return () => clearTimeout(timeout);
  }, [loading, router]);

  if (loading || !user || userProfile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminNavbar/>
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar/>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
