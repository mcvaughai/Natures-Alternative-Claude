"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FarmCard from "@/components/shared/FarmCard";
import FarmFilterSidebar, { FarmFilterProvider, FarmActiveFiltersBar } from "@/components/FarmFilterSidebar";
import SectionHeader from "@/components/shared/SectionHeader";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  "Featured", "Nearest First", "Highest Rated",
  "Most Products", "Newest to Platform", "A-Z",
];

const FARMS = [
  {
    id:           "example-farms",
    name:         "Example Farms",
    location:     "Houston, TX",
    description:  "Pasture-raised meats and fresh seasonal vegetables from our 120-acre family farm in the Texas Hill Country.",
    categories:   ["Meat & Poultry", "Dairy & Eggs"],
    fulfillment:  ["Pickup", "Delivery"],
    rating:       4.9,
    reviewCount:  42,
    productCount: 24,
  },
  {
    id:           "purple-food-crew",
    name:         "Purple Food Crew",
    location:     "Houston, TX",
    description:  "Specializing in heirloom varieties and rare produce grown chemical-free by our three-generation family.",
    categories:   ["Fruits & Vegetables", "Herbs & Botanicals"],
    fulfillment:  ["Pickup", "Ships"],
    rating:       4.7,
    reviewCount:  18,
    productCount: 16,
  },
  {
    id:           "force-of-nature",
    name:         "Force of Nature",
    location:     "Austin, TX",
    description:  "Regenerative ranching at its finest — premium pasture-raised meats raised on open Texas rangeland.",
    categories:   ["Meat & Poultry"],
    fulfillment:  ["Ships", "Delivery"],
    rating:       4.8,
    reviewCount:  31,
    productCount: 8,
  },
  {
    id:           "ww-farms",
    name:         "W&W Farms",
    location:     "Dallas, TX",
    description:  "A century of farming tradition bringing you consistent quality dairy and baked goods you can taste.",
    categories:   ["Dairy & Eggs", "Bakery & Breads"],
    fulfillment:  ["Pickup"],
    rating:       4.6,
    reviewCount:  12,
    productCount: 11,
  },
  {
    id:           "green-valley-farm",
    name:         "Green Valley Farm",
    location:     "San Antonio, TX",
    description:  "Certified natural vegetable farm serving the San Antonio area with fresh seasonal produce every week.",
    categories:   ["Fruits & Vegetables"],
    fulfillment:  ["Pickup", "Delivery"],
    rating:       4.5,
    reviewCount:  9,
    productCount: 14,
  },
  {
    id:           "sunrise-organics",
    name:         "Sunrise Organics",
    location:     "Houston, TX",
    description:  "Small-batch handcrafted skincare and herbal products made with organic botanicals grown on our farm.",
    categories:   ["Natural Skincare", "Herbs & Botanicals"],
    fulfillment:  ["Ships"],
    rating:       4.8,
    reviewCount:  27,
    productCount: 19,
  },
  {
    id:           "heritage-acres",
    name:         "Heritage Acres",
    location:     "College Station, TX",
    description:  "Traditional heritage-breed livestock farm raising cattle and chickens on natural open pasture grasses.",
    categories:   ["Meat & Poultry", "Dairy & Eggs"],
    fulfillment:  ["Pickup"],
    rating:       4.7,
    reviewCount:  15,
    productCount: 6,
  },
  {
    id:           "river-bend-farm",
    name:         "River Bend Farm",
    location:     "Katy, TX",
    description:  "Family farm along the Brazos River growing seasonal fruits, vegetables, and raw wildflower honey.",
    categories:   ["Fruits & Vegetables", "Honey & Preserves"],
    fulfillment:  ["Pickup", "Delivery"],
    rating:       4.9,
    reviewCount:  8,
    productCount: 12,
  },
  {
    id:           "lone-star-organics",
    name:         "Lone Star Organics",
    location:     "Houston, TX",
    description:  "Houston's most diverse natural farm — produce, meats, dairy, skincare, and pantry staples all in one place.",
    categories:   ["Fruits & Vegetables", "Meat & Poultry", "Natural Skincare"],
    fulfillment:  ["Pickup", "Delivery", "Ships"],
    rating:       4.6,
    reviewCount:  36,
    productCount: 47,
  },
  {
    id:           "prairie-wind-farm",
    name:         "Prairie Wind Farm",
    location:     "Waco, TX",
    description:  "Open-range cattle and dairy farm on the Texas prairie. Known for rich butter and grass-fed beef.",
    categories:   ["Meat & Poultry", "Dairy & Eggs"],
    fulfillment:  ["Pickup"],
    rating:       4.4,
    reviewCount:  6,
    productCount: 9,
  },
  {
    id:           "cedar-creek-farm",
    name:         "Cedar Creek Farm",
    location:     "Conroe, TX",
    description:  "Artisan bakery farm specializing in sourdough breads, pastries, and locally-sourced honey products.",
    categories:   ["Bakery & Breads", "Honey & Preserves"],
    fulfillment:  ["Pickup", "Ships"],
    rating:       4.8,
    reviewCount:  14,
    productCount: 15,
  },
  {
    id:           "bluebonnet-farms",
    name:         "Bluebonnet Farms",
    location:     "Brenham, TX",
    description:  "Rolling Brenham hills dairy farm offering fresh milk, artisan cheeses, and seasonal stone fruits.",
    categories:   ["Dairy & Eggs", "Fruits & Vegetables"],
    fulfillment:  ["Pickup", "Delivery"],
    rating:       4.7,
    reviewCount:  11,
    productCount: 13,
  },
];

const FEATURED_IDS = ["example-farms", "force-of-nature", "sunrise-organics"];
const FEATURED_FARMS = FARMS.filter((f) => FEATURED_IDS.includes(f.id));

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FarmsPage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [sort, setSort]             = useState("Featured");

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
                <span className="text-sm font-semibold">12 Active Farms</span>
              </div>
              <div className="w-px h-5 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">📍</span>
                <span className="text-sm font-semibold">4 States Represented</span>
              </div>
              <div className="w-px h-5 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">🛒</span>
                <span className="text-sm font-semibold">142 Products Available</span>
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
                    Showing <span className="font-semibold text-gray-700">12 farms</span>
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

                {/* Farm cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {FARMS.map((farm) => (
                    <FarmCard key={farm.id} {...farm} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {[1, 2].map((page) => (
                    <button
                      key={page}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === 1 ? "bg-[#1a4a2e] text-white" : "border border-gray-200 text-gray-600 hover:border-[#1a4a2e] hover:text-[#1a4a2e]"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </FarmFilterProvider>
        </div>

        {/* ── Featured Farms ────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SectionHeader title="Featured Farms" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURED_FARMS.map((farm) => (
              <FarmCard key={farm.id} {...farm} featured />
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
