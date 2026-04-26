"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FarmCard, { FarmCardData } from "@/components/shared/FarmCard";
import FarmFilterSidebar, { FarmFilterProvider, FarmActiveFiltersBar } from "@/components/FarmFilterSidebar";
import SectionHeader from "@/components/shared/SectionHeader";
import { supabase } from "@/lib/supabase";

const SORT_OPTIONS = [
  "Featured", "Nearest First", "Highest Rated",
  "Most Products", "Newest to Platform", "A-Z",
];

function mapFulfillment(raw: string[] | null): string[] {
  return (raw ?? []).map((f) => {
    if (f === "Local Delivery") return "Delivery";
    if (f === "Farm Pickup") return "Pickup";
    if (f === "Shipping") return "Ships";
    return f;
  });
}

export default function FarmsPage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [sort, setSort]             = useState("Featured");
  const [farms, setFarms]           = useState<FarmCardData[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    supabase
      .from("sellers")
      .select("slug, farm_name, city, state, description, fulfillment")
      .eq("status", "approved")
      .then(({ data }) => {
        if (data) {
          setFarms(
            data.map((s) => ({
              id:           s.slug,
              name:         s.farm_name,
              location:     [s.city, s.state].filter(Boolean).join(", "),
              description:  s.description ?? "",
              categories:   [],
              fulfillment:  mapFulfillment(s.fulfillment),
              rating:       0,
              reviewCount:  0,
              productCount: 0,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-[#1a4a2e] py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Browse Our Farms</h1>
            <p className="text-[#f5f0e8] opacity-90 text-lg mb-8">
              Discover natural farms in your area and across the country
            </p>
            <form onSubmit={handleHeroSearch} className="relative max-w-xl mx-auto">
              <input
                type="search"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search farms by name, location or product..."
                className="w-full rounded-full px-6 py-3.5 pr-14 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white rounded-full p-2.5 transition-colors"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </button>
            </form>
          </div>
        </section>

        {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-[#eee8dc] border-b border-[#ddd5c5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">🌿</span>
                <span className="text-sm font-semibold">
                  {loading ? "..." : `${farms.length} Active Farm${farms.length !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="w-px h-5 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">📍</span>
                <span className="text-sm font-semibold">Texas</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FarmFilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Sidebar */}
              <FarmFilterSidebar />

              {/* Grid */}
              <div className="flex-1 min-w-0">
                <FarmActiveFiltersBar />

                {/* Grid header */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{farms.length} farms</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none bg-white"
                      >
                        {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {farms.map((farm) => (
                      <FarmCard key={farm.id} {...farm} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FarmFilterProvider>
        </div>

        {/* ── Featured Farms ────────────────────────────────────────────────── */}
        {farms.slice(0, 3).length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <SectionHeader title="Featured Farms" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {farms.slice(0, 3).map((farm) => (
                <FarmCard key={`featured-${farm.id}`} {...farm} featured />
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
