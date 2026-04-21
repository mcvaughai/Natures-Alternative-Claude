"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SellerUser { name: string; email: string; loggedIn: boolean; }

export default function SellerNavbar() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerUser | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("seller");
      if (s) setSeller(JSON.parse(s));
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("seller");
    router.push("/seller/login");
  };

  return (
    <header className="bg-[#1a4a2e] h-14 flex items-center px-4 sm:px-6 shrink-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="flex flex-col items-start mr-8 shrink-0">
        <Image
          src="/main_logo.png"
          alt="Natures Alternative Market Place"
          width={150}
          height={50}
          className="object-contain"
        />
        <span className="text-green-300 text-[11px] tracking-wide -mt-1">Seller Center</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="text-white/70 hover:text-white transition-colors" aria-label="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* View My Store */}
        <Link
          href="/store/1"
          className="hidden sm:flex items-center gap-1.5 text-green-200 hover:text-white transition-colors text-xs font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View My Store
        </Link>

        <div className="w-px h-5 bg-white/20" />

        {/* Avatar + name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {seller?.name?.charAt(0)?.toUpperCase() ?? "S"}
          </div>
          <span className="hidden sm:block text-white text-sm font-medium max-w-[130px] truncate">
            {seller?.name ?? "Seller"}
          </span>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="text-white/70 hover:text-white transition-colors" aria-label="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
