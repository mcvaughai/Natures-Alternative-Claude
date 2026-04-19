"use client";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";

const TABS = [
  { label: "All Products",         key: "all",               href: "/explore" },
  { label: "Meat & Seafood",       key: "meat-seafood",      href: "/explore?category=meat-seafood" },
  { label: "Fruits & Vegetables",  key: "fruits-vegetables", href: "/explore?category=fruits-vegetables" },
];

// Separated so Suspense can wrap just this piece (useSearchParams requirement)
function CategoryTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const activeKey = pathname === "/explore" ? category : "all";
  return <TabsRow activeKey={activeKey} />;
}

function TabsRow({ activeKey }: { activeKey: string }) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeKey === tab.key
                ? "border-[#1a4a2e] text-[#1a4a2e]"
                : "border-transparent text-gray-500 hover:text-[#1a4a2e] hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50">
      {/* ── Main bar ─────────────────────────────────────────── */}
      <div className="bg-[#1a4a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold shrink-0">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="12" r="9" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
              <path d="M15 4 C10 4 7 8 7 12 C7 16 10 19 15 20 C20 19 23 16 23 12 C23 8 20 4 15 4Z" fill="white" opacity="0.85" />
              <line x1="15" y1="20" x2="15" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 15 Q15 11 19 15" stroke="#1a4a2e" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M12 18 Q15 14 18 18" stroke="#1a4a2e" strokeWidth="1" fill="none" opacity="0.5" />
            </svg>
            <span className="text-sm sm:text-[15px] leading-snug font-semibold tracking-tight max-w-[150px] sm:max-w-none">
              Natures Alternative<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Market Place
            </span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 mx-2 sm:mx-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search Available Products"
                className="w-full rounded-full px-5 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-5 text-white text-sm whitespace-nowrap">
            <a href="#" className="hover:text-green-200 transition-colors">About us</a>
            <Link href="/explore" className="hover:text-green-200 transition-colors">Our Store</Link>
            <a href="#" className="hover:text-green-200 transition-colors">Become a seller</a>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 ml-1 shrink-0">
            <Link href="/cart" className="relative text-white hover:text-green-200 transition-colors" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#8b1a1a] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            <Link href="/account" className="text-white hover:text-green-200 transition-colors" aria-label="Profile">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category tabs — Suspense required for useSearchParams ─ */}
      <Suspense fallback={<TabsRow activeKey="all" />}>
        <CategoryTabs />
      </Suspense>
    </header>
  );
}
