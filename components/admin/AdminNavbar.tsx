"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { signOut } from "@/lib/auth";

export default function AdminNavbar() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const name = userProfile
    ? `${userProfile.first_name ?? ""} ${userProfile.last_name ?? ""}`.trim() || userProfile.email
    : "Admin";

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <header className="h-14 bg-[#1a4a2e] flex items-center px-5 gap-4 shrink-0 z-30">
      {/* Logo */}
      <div className="flex flex-col items-start shrink-0">
        <Image
          src="/main_logo.png"
          alt="Natures Alternative Market Place"
          width={150}
          height={50}
          className="object-contain"
        />
        <span className="text-green-300 text-[11px] font-medium -mt-1">Admin Portal</span>
      </div>

      <div className="flex-1"/>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative text-white/70 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">3</span>
        </button>

        {/* View Marketplace */}
        <Link href="/" className="hidden sm:block text-green-200 hover:text-white text-xs font-medium transition-colors border border-green-700 hover:border-green-400 px-3 py-1.5 rounded-lg">
          View Marketplace
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-white/20"/>

        {/* Avatar + name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white text-xs font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-white text-sm font-medium">{name}</span>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="text-white/60 hover:text-red-300 transition-colors" aria-label="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
