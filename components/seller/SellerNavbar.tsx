"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { logoutSeller } from "@/lib/logout";
import { getSellerSession } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

export default function SellerNavbar() {
  const [farmName, setFarmName] = useState("Seller");
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    const session = getSellerSession();
    if (!session) return;
    if (session.farm_name) setFarmName(session.farm_name);

    const sellerId = session.seller_id;
    if (!sellerId) return;

    fetch(
      `${SUPABASE_URL}/rest/v1/sellers?id=eq.${sellerId}&select=slug`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )
      .then(res => res.json())
      .then(data => {
        const slug = Array.isArray(data) && data[0]?.slug;
        setStoreUrl(slug ? `/store/${slug}` : `/store/${sellerId}`);
      })
      .catch(() => {
        setStoreUrl(`/store/${sellerId}`);
      });
  }, []);

  return (
    <header className="bg-[#053D2D] py-4 flex items-center px-4 sm:px-6 shrink-0 z-40" style={{ boxShadow: '0px 4px 4px rgba(0,0,0,0.25)' }}>
      {/* Logo */}
      <div className="mr-8 shrink-0">
        <Image
          src="/main_logo.png"
          alt="Natures Alternative Market Place"
          width={150}
          height={50}
          className="object-contain"
        />
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
          href={storeUrl ?? "#"}
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
            {farmName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-white text-sm font-medium max-w-[130px] truncate">
            {farmName}
          </span>
        </div>

        {/* Logout */}
        <button onClick={logoutSeller} className="text-white/70 hover:text-white transition-colors" aria-label="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
