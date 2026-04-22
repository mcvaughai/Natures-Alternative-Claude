"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/context/CartContext";

interface MockUser {
  name: string;
  email: string;
  role: string;
  loggedIn: boolean;
}

const TABS = [
  { label: "All Products",         key: "all",               href: "/explore" },
  { label: "Farms",                key: "farms",             href: "/farms" },
  { label: "Meat & Poultry",       key: "meat-poultry",      href: "/category/meat-poultry" },
  { label: "Fruits & Vegetables",  key: "fruits-vegetables", href: "/category/fruits-vegetables" },
  { label: "Dairy & Eggs",         key: "dairy-eggs",        href: "/category/dairy-eggs" },
  { label: "Seafood",              key: "seafood",           href: "/category/seafood" },
  { label: "Bakery & Breads",      key: "bakery-breads",     href: "/category/bakery-breads" },
  { label: "Honey & Preserves",    key: "honey-preserves",   href: "/category/honey-preserves" },
  { label: "Herbs & Botanicals",   key: "herbs-botanicals",  href: "/category/herbs-botanicals" },
  { label: "Natural Skincare",     key: "natural-skincare",  href: "/category/natural-skincare" },
  { label: "Candles & Home",       key: "candles-home",      href: "/category/candles-home" },
  { label: "Natural Cleaning",     key: "natural-cleaning",  href: "/category/natural-cleaning" },
];

// ── Category tab bar ─────────────────────────────────────────────────────────
function CategoryTabs() {
  const pathname = usePathname();
  let activeKey = "";
  if (pathname === "/explore") {
    activeKey = "all";
  } else if (pathname === "/farms") {
    activeKey = "farms";
  } else if (pathname.startsWith("/category/")) {
    activeKey = pathname.replace("/category/", "");
  }
  return <TabsRow activeKey={activeKey} />;
}

function TabsRow({ activeKey }: { activeKey: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative">
      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -180, behavior: "smooth" })}
          className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-white via-white/90 to-transparent flex items-center"
          aria-label="Scroll tabs left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Scrollable tab list */}
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors shrink-0 ${
              activeKey === tab.key
                ? "bg-[#1a4a2e] text-white"
                : "text-[#1a4a2e] hover:bg-[#1a4a2e]/10"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
          className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-white via-white/90 to-transparent flex items-center"
          aria-label="Scroll tabs right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Navbar() {
  const { totalItems } = useCart();
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Read auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed: MockUser = JSON.parse(stored);
        if (parsed.loggedIn) setUser(parsed);
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-50">
      {/* ── Main bar ─────────────────────────────────────────── */}
      <div className="bg-[#1a4a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/main_logo.png"
              alt="Natures Alternative Market Place"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </Link>

          {/* Search bar */}
          <div className="flex-1 mx-2 sm:mx-4">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
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
            <Link href="/about" className="hover:text-green-200 transition-colors">About us</Link>
            <Link href="/explore" className="hover:text-green-200 transition-colors">Our Store</Link>
            <Link href="/seller" className="hover:text-green-200 transition-colors">Become a seller</Link>
            <Link href="/seller/login" className="text-green-300 hover:text-white transition-colors text-xs border border-green-600 hover:border-green-300 px-2.5 py-1 rounded-lg">Seller Center</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 ml-1 shrink-0">
            {/* Cart */}
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

            {/* Profile / User menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  aria-label="User menu"
                  aria-expanded={menuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white text-sm font-bold">
                    {initial}
                  </div>
                  <span className="hidden sm:block text-white text-sm font-medium max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-white/70 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-52 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Account
                    </Link>
                    <Link href="/account/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      My Orders
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleSignOut} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-white hover:text-green-200 transition-colors" aria-label="Login">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────── */}
      <CategoryTabs />
    </header>
  );
}
