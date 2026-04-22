"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FarmFilterState {
  search:         string;
  zipCode:        string;
  distance:       string;
  fulfillment:    string[];
  products:       string[];
  certifications: string[];
  farmSize:       string[];
  rating:         string;
  availability:   string[];
}

type ArrayField = "fulfillment" | "products" | "certifications" | "farmSize" | "availability";

interface FarmFilterContextValue {
  filters:       FarmFilterState;
  setFilters:    React.Dispatch<React.SetStateAction<FarmFilterState>>;
  activeCount:   number;
  activeFilters: { key: string; label: string }[];
  removeFilter:  (key: string) => void;
  clearAll:      () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FULFILLMENT_OPTIONS = [
  "Offers Farm Pickup", "Offers Local Delivery", "Offers Shipping", "Ships Nationwide",
];

const PRODUCTS_SOLD = [
  "Meat & Poultry", "Fruits & Vegetables", "Dairy & Eggs", "Seafood",
  "Bakery & Breads", "Honey & Preserves", "Herbs & Botanicals",
  "Natural Skincare", "Candles & Home", "Natural Cleaning",
];

const CERTIFICATIONS = [
  "Certified Organic", "Regenerative Farming", "Pasture Raised", "Grass Fed & Finished",
  "Non GMO", "No Synthetic Pesticides", "Free Range", "Humane Certified",
  "Cruelty Free", "Small Batch Handmade",
];

const FARM_SIZES = [
  "Small Family Farm (under 50 acres)", "Medium Farm (50–200 acres)",
  "Large Farm (200+ acres)", "Urban Farm / Garden", "Home Producer",
];

const DISTANCES = [
  "Within 10 miles", "Within 25 miles", "Within 50 miles",
  "Within 100 miles", "Nationwide / Ships Everywhere",
];

const AVAILABILITY_OPTIONS = [
  "Currently Accepting Orders", "New to Platform", "Seasonal Sellers",
];

const DEFAULT_FILTERS: FarmFilterState = {
  search: "", zipCode: "", distance: "",
  fulfillment: [], products: [], certifications: [],
  farmSize: [], rating: "", availability: [],
};

// ─── Context ──────────────────────────────────────────────────────────────────

const FarmFilterContext = createContext<FarmFilterContextValue | null>(null);

function useFarmFilterContext(): FarmFilterContextValue {
  const ctx = useContext(FarmFilterContext);
  if (!ctx) throw new Error("Must be inside FarmFilterProvider");
  return ctx;
}

export function FarmFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FarmFilterState>(DEFAULT_FILTERS);

  const activeFilters: { key: string; label: string }[] = [
    ...(filters.distance ? [{ key: `dist:${filters.distance}`, label: filters.distance }] : []),
    ...filters.fulfillment.map((f) => ({ key: `ful:${f}`,   label: f })),
    ...filters.products.map((p)    => ({ key: `prod:${p}`,  label: p })),
    ...filters.certifications.map((c) => ({ key: `cert:${c}`, label: c })),
    ...filters.farmSize.map((s)    => ({ key: `size:${s}`,  label: s })),
    ...(filters.rating ? [{ key: `rat:${filters.rating}`, label: filters.rating }] : []),
    ...filters.availability.map((a) => ({ key: `avail:${a}`, label: a })),
  ];

  const activeCount = activeFilters.length;

  function removeFilter(key: string) {
    setFilters((prev) => {
      if (key.startsWith("dist:"))  return { ...prev, distance:       "" };
      if (key.startsWith("ful:"))   return { ...prev, fulfillment:    prev.fulfillment.filter((f) => f !== key.slice(4)) };
      if (key.startsWith("prod:"))  return { ...prev, products:       prev.products.filter((p) => p !== key.slice(5)) };
      if (key.startsWith("cert:"))  return { ...prev, certifications: prev.certifications.filter((c) => c !== key.slice(5)) };
      if (key.startsWith("size:"))  return { ...prev, farmSize:       prev.farmSize.filter((s) => s !== key.slice(5)) };
      if (key.startsWith("rat:"))   return { ...prev, rating:         "" };
      if (key.startsWith("avail:")) return { ...prev, availability:   prev.availability.filter((a) => a !== key.slice(6)) };
      return prev;
    });
  }

  function clearAll() { setFilters(DEFAULT_FILTERS); }

  return (
    <FarmFilterContext.Provider value={{ filters, setFilters, activeCount, activeFilters, removeFilter, clearAll }}>
      {children}
    </FarmFilterContext.Provider>
  );
}

// ─── Active Filters Bar ───────────────────────────────────────────────────────

export function FarmActiveFiltersBar() {
  const { activeFilters, activeCount, removeFilter, clearAll } = useFarmFilterContext();
  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-200">
      {activeFilters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => removeFilter(key)}
          className="flex items-center gap-1.5 bg-[#1a4a2e]/10 text-[#1a4a2e] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#1a4a2e]/20 transition-colors"
        >
          {label}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
      <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-700 underline ml-1">
        Clear All
      </button>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function Section({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 last:border-0 py-3.5">
      <button onClick={onToggle} className="flex items-center justify-between w-full text-left">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 ${i <= count ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-200 stroke-gray-200"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent() {
  const { filters, setFilters, activeCount, clearAll } = useFarmFilterContext();
  const [zipInput, setZipInput] = useState(filters.zipCode);

  const [openSections, setOpenSections] = useState({
    distance:       true,
    fulfillment:    true,
    products:       false,
    certifications: false,
    farmSize:       false,
    rating:         true,
    availability:   true,
  });

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArray(field: ArrayField, value: string) {
    setFilters((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  return (
    <div>
      {/* Search */}
      <div className="pb-3.5 border-b border-gray-100">
        <div className="relative">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search farms..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2 pr-9 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/20 focus:border-[#1a4a2e] bg-gray-50"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </div>
      </div>

      {/* Distance */}
      <Section title="Distance From You" open={openSections.distance} onToggle={() => toggleSection("distance")}>
        <p className="text-xs text-gray-400 italic mb-2">Enter your zip code to filter by distance</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setFilters((prev) => ({ ...prev, zipCode: zipInput }))}
            placeholder="ZIP code"
            maxLength={10}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4a2e] focus:border-[#1a4a2e]"
          />
          <button
            onClick={() => setFilters((prev) => ({ ...prev, zipCode: zipInput }))}
            className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Update
          </button>
        </div>
        {filters.zipCode && (
          <div className="space-y-2">
            {DISTANCES.map((dist) => (
              <label key={dist} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="farm-distance"
                  checked={filters.distance === dist}
                  onChange={() => setFilters((prev) => ({ ...prev, distance: dist }))}
                  className="w-4 h-4 border-gray-300 accent-[#1a4a2e] cursor-pointer"
                />
                <span className={`text-sm ${filters.distance === dist ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                  {dist}
                </span>
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* Fulfillment */}
      <Section title="Fulfillment Options" open={openSections.fulfillment} onToggle={() => toggleSection("fulfillment")}>
        <div className="space-y-2">
          {FULFILLMENT_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.fulfillment.includes(opt)}
                onChange={() => toggleArray("fulfillment", opt)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.fulfillment.includes(opt) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Products Sold */}
      <Section title="Products They Sell" open={openSections.products} onToggle={() => toggleSection("products")}>
        <div className="space-y-2">
          {PRODUCTS_SOLD.map((prod) => (
            <label key={prod} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.products.includes(prod)}
                onChange={() => toggleArray("products", prod)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.products.includes(prod) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {prod}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Certifications */}
      <Section title="Farm Certifications" open={openSections.certifications} onToggle={() => toggleSection("certifications")}>
        <div className="space-y-2">
          {CERTIFICATIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.certifications.includes(cert)}
                onChange={() => toggleArray("certifications", cert)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.certifications.includes(cert) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {cert}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Farm Size */}
      <Section title="Farm Size" open={openSections.farmSize} onToggle={() => toggleSection("farmSize")}>
        <div className="space-y-2">
          {FARM_SIZES.map((size) => (
            <label key={size} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.farmSize.includes(size)}
                onChange={() => toggleArray("farmSize", size)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.farmSize.includes(size) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {size}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Rating" open={openSections.rating} onToggle={() => toggleSection("rating")}>
        <div className="space-y-2">
          {[
            { label: "4 stars and up", stars: 4 },
            { label: "3 stars and up", stars: 3 },
            { label: "2 stars and up", stars: 2 },
            { label: "Any rating",     stars: 0 },
          ].map(({ label, stars }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="farm-rating"
                checked={filters.rating === label}
                onChange={() => setFilters((prev) => ({ ...prev, rating: label }))}
                className="w-4 h-4 border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                {stars > 0 && <Stars count={stars} />}
                <span className={`text-sm ${filters.rating === label ? "text-[#1a4a2e] font-medium" : "text-gray-700"}`}>
                  {label}
                </span>
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability" open={openSections.availability} onToggle={() => toggleSection("availability")}>
        <div className="space-y-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.availability.includes(opt)}
                onChange={() => toggleArray("availability", opt)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.availability.includes(opt) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="pt-4">
        <button className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
          Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2 py-1">
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main FarmFilterSidebar ───────────────────────────────────────────────────

export default function FarmFilterSidebar() {
  const { activeCount } = useFarmFilterContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-[#1a4a2e] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filter Farms{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <h2 className="font-bold text-gray-900 mb-1">Filter Farms</h2>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white z-50 shadow-xl overflow-y-auto lg:hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">
                  Filter Farms{activeCount > 0 ? ` (${activeCount})` : ""}
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        </>
      )}
    </>
  );
}
