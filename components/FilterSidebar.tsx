"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterState {
  searchWithin: string;
  categories: string[];
  subcategories: string[];
  fulfillment: string[];
  distance: string;
  minPrice: number;
  maxPrice: number;
  certifications: string[];
  rating: string;
  availability: string[];
  farms: string[];
  farmSearch: string;
}

type CheckboxField = "categories" | "subcategories" | "fulfillment" | "certifications" | "availability" | "farms";

interface FilterContextValue {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  activeCount: number;
  activeFilters: { key: string; label: string }[];
  removeFilter: (key: string) => void;
  clearAll: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All Products",        key: "all",               count: 128 },
  { label: "Meat & Poultry",      key: "meat-poultry",      count: 34  },
  { label: "Fruits & Vegetables", key: "fruits-vegetables", count: 42  },
  { label: "Dairy & Eggs",        key: "dairy-eggs",        count: 18  },
  { label: "Seafood",             key: "seafood",           count: 12  },
  { label: "Bakery & Breads",     key: "bakery-breads",     count: 9   },
  { label: "Honey & Preserves",   key: "honey-preserves",   count: 7   },
  { label: "Herbs & Botanicals",  key: "herbs-botanicals",  count: 6   },
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
);

const SUBCATEGORIES: Record<string, string[]> = {
  "meat-poultry":      ["Beef", "Chicken", "Pork", "Lamb & Goat", "Turkey", "Duck & Game Birds", "Sausages & Cured Meats", "Organ Meats"],
  "fruits-vegetables": ["Fresh Vegetables", "Fresh Fruits", "Leafy Greens", "Root Vegetables", "Microgreens & Sprouts", "Mushrooms", "Seasonal Produce"],
  "dairy-eggs":        ["Raw Milk", "Pasteurized Milk", "Cheese", "Butter & Cream", "Yogurt & Kefir", "Chicken Eggs", "Duck & Quail Eggs"],
  "seafood":           ["Fresh Fish", "Shellfish", "Smoked Fish", "Dried & Preserved Seafood"],
  "bakery-breads":     ["Sourdough Bread", "Whole Grain Breads", "Pastries & Sweets", "Tortillas & Flatbreads", "Granola & Cereals"],
  "honey-preserves":   ["Raw Honey", "Jams & Jellies", "Fermented Foods", "Pickles & Ferments", "Sauces & Condiments", "Syrups & Sweeteners"],
  "herbs-botanicals":  ["Fresh Herbs", "Dried Herbs & Spices", "Herbal Teas", "Tinctures & Extracts", "Essential Oils"],
};

const FULFILLMENT    = ["Farm Pickup", "Local Delivery", "Shipping Available", "Ready to Ship"];
const DISTANCES      = ["Within 10 miles", "Within 25 miles", "Within 50 miles", "Within 100 miles", "Nationwide"];
const CERTIFICATIONS = ["Certified Organic", "Regenerative Farming", "Pasture Raised", "Grass Fed & Finished", "Non GMO", "No Synthetic Pesticides", "Free Range", "Humane Certified"];
const AVAILABILITY   = ["In Stock Only", "On Sale / Discounted", "New Arrivals", "Seasonal Items"];
const FARMS          = ["Example Farms", "Purple Food Crew", "Force of Nature", "W&W Farms"];

const PRICE_PRESETS: [string, number, number][] = [
  ["Under $10",  0,   10],
  ["$10–$25",   10,   25],
  ["$25–$50",   25,   50],
  ["Over $50",  50,  200],
];

const PRICE_MAX = 200;

const DEFAULT_FILTERS: FilterState = {
  searchWithin: "",
  categories:   [],
  subcategories:[],
  fulfillment:  [],
  distance:     "",
  minPrice:     0,
  maxPrice:     PRICE_MAX,
  certifications:[],
  rating:       "",
  availability: [],
  farms:        [],
  farmSearch:   "",
};

// ─── Context ──────────────────────────────────────────────────────────────────

const FilterContext = createContext<FilterContextValue | null>(null);

function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("Must be inside FilterProvider");
  return ctx;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const activeFilters: { key: string; label: string }[] = [
    ...filters.categories.map((c) => ({ key: `cat:${c}`, label: CATEGORY_LABEL[c] ?? c })),
    ...filters.subcategories.map((s) => ({ key: `sub:${s}`, label: s })),
    ...filters.fulfillment.map((f) => ({ key: `ful:${f}`, label: f })),
    ...(filters.distance ? [{ key: `dist:${filters.distance}`, label: filters.distance }] : []),
    ...(filters.minPrice > 0 || filters.maxPrice < PRICE_MAX
      ? [{ key: "price:range", label: `$${filters.minPrice}–$${filters.maxPrice}` }]
      : []),
    ...filters.certifications.map((c) => ({ key: `cert:${c}`, label: c })),
    ...(filters.rating ? [{ key: `rat:${filters.rating}`, label: filters.rating }] : []),
    ...filters.availability.map((a) => ({ key: `avail:${a}`, label: a })),
    ...filters.farms.map((f) => ({ key: `farm:${f}`, label: f })),
  ];

  const activeCount = activeFilters.length;

  function removeFilter(key: string) {
    setFilters((prev) => {
      if (key.startsWith("cat:"))  return { ...prev, categories:     prev.categories.filter((c) => c !== key.slice(4)) };
      if (key.startsWith("sub:"))  return { ...prev, subcategories:  prev.subcategories.filter((s) => s !== key.slice(4)) };
      if (key.startsWith("ful:"))  return { ...prev, fulfillment:    prev.fulfillment.filter((f) => f !== key.slice(4)) };
      if (key.startsWith("dist:")) return { ...prev, distance:       "" };
      if (key === "price:range")   return { ...prev, minPrice: 0, maxPrice: PRICE_MAX };
      if (key.startsWith("cert:")) return { ...prev, certifications: prev.certifications.filter((c) => c !== key.slice(5)) };
      if (key.startsWith("rat:"))  return { ...prev, rating:         "" };
      if (key.startsWith("avail:"))return { ...prev, availability:   prev.availability.filter((a) => a !== key.slice(6)) };
      if (key.startsWith("farm:")) return { ...prev, farms:          prev.farms.filter((f) => f !== key.slice(5)) };
      return prev;
    });
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <FilterContext.Provider value={{ filters, setFilters, activeCount, activeFilters, removeFilter, clearAll }}>
      {children}
    </FilterContext.Provider>
  );
}

// ─── Active Filters Bar ───────────────────────────────────────────────────────

export function ActiveFiltersBar() {
  const { activeFilters, activeCount, removeFilter, clearAll } = useFilterContext();
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

// ─── Star Rating ──────────────────────────────────────────────────────────────

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

// ─── Dual Price Slider ────────────────────────────────────────────────────────

function PriceSlider({ min, max, onMinChange, onMaxChange }: {
  min: number; max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  const leftPct  = (min / PRICE_MAX) * 100;
  const rightPct = ((PRICE_MAX - max) / PRICE_MAX) * 100;

  return (
    <div>
      {/* Visual track */}
      <div className="relative h-6 mb-3 select-none">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#1a4a2e] rounded-full pointer-events-none"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        {/* Invisible min range */}
        <input
          type="range" min={0} max={PRICE_MAX} value={min}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 1))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: min > PRICE_MAX - 20 ? 5 : 3 }}
        />
        {/* Invisible max range */}
        <input
          type="range" min={0} max={PRICE_MAX} value={max}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 1))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        {/* Visual min thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1a4a2e] rounded-full shadow-sm pointer-events-none"
          style={{ left: `calc(${leftPct}% - 8px)` }}
        />
        {/* Visual max thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1a4a2e] rounded-full shadow-sm pointer-events-none"
          style={{ left: `calc(${(max / PRICE_MAX) * 100}% - 8px)` }}
        />
      </div>

      {/* Min / Max inputs */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input
            type="number" value={min} min={0} max={max - 1}
            onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 1))}
            className="w-full pl-5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a4a2e] text-center"
          />
        </div>
        <span className="text-gray-300 text-xs">—</span>
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input
            type="number" value={max} min={min + 1} max={PRICE_MAX}
            onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 1))}
            className="w-full pl-5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a4a2e] text-center"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRICE_PRESETS.map(([label, pMin, pMax]) => (
          <button
            key={label}
            onClick={() => { onMinChange(pMin); onMaxChange(pMax); }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              min === pMin && max === pMax
                ? "bg-[#1a4a2e] text-white border-[#1a4a2e]"
                : "border-gray-200 text-gray-600 hover:border-[#1a4a2e] hover:text-[#1a4a2e]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent() {
  const { filters, setFilters, activeCount, clearAll } = useFilterContext();

  const [openSections, setOpenSections] = useState({
    categories: true, subcategories: true, fulfillment: true,
    distance: true, price: true, certifications: true,
    rating: true, availability: true, farms: true,
  });

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleCheckbox(field: CheckboxField, value: string) {
    setFilters((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  const visibleSubcats = filters.categories.flatMap((c) => SUBCATEGORIES[c] ?? []);

  return (
    <div>
      {/* Search within */}
      <div className="pb-3.5 border-b border-gray-100">
        <div className="relative">
          <input
            type="search"
            value={filters.searchWithin}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchWithin: e.target.value }))}
            placeholder="Search products..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2 pr-9 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/20 focus:border-[#1a4a2e] bg-gray-50"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <Section title="Categories" open={openSections.categories} onToggle={() => toggleSection("categories")}>
        <div className="space-y-2">
          {/* All Products row */}
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={filters.categories.length === 0}
                onChange={() => setFilters((prev) => ({ ...prev, categories: [], subcategories: [] }))}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.categories.length === 0 ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                All Products
              </span>
            </div>
            <span className="text-xs text-gray-400">(128)</span>
          </label>
          {/* Other categories */}
          {CATEGORIES.slice(1).map((cat) => (
            <label key={cat.key} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.key)}
                  onChange={() => toggleCheckbox("categories", cat.key)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
                />
                <span className={`text-sm ${filters.categories.includes(cat.key) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                  {cat.label}
                </span>
              </div>
              <span className="text-xs text-gray-400">({cat.count})</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Subcategories — visible when a category with subs is selected */}
      {visibleSubcats.length > 0 && (
        <Section title="Subcategories" open={openSections.subcategories} onToggle={() => toggleSection("subcategories")}>
          <div className="space-y-2">
            {visibleSubcats.map((sub) => (
              <label key={sub} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.subcategories.includes(sub)}
                  onChange={() => toggleCheckbox("subcategories", sub)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
                />
                <span className={`text-sm ${filters.subcategories.includes(sub) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                  {sub}
                </span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Fulfillment */}
      <Section title="Fulfillment Type" open={openSections.fulfillment} onToggle={() => toggleSection("fulfillment")}>
        <div className="space-y-2">
          {FULFILLMENT.map((method) => (
            <label key={method} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.fulfillment.includes(method)}
                onChange={() => toggleCheckbox("fulfillment", method)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.fulfillment.includes(method) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {method}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Distance */}
      <Section title="Distance" open={openSections.distance} onToggle={() => toggleSection("distance")}>
        <div className="space-y-2">
          {DISTANCES.map((dist) => (
            <label key={dist} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="filter-distance"
                checked={filters.distance === dist}
                onChange={() => setFilters((prev) => ({ ...prev, distance: dist }))}
                className="w-4 h-4 border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.distance === dist ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {dist}
              </span>
            </label>
          ))}
          <p className="text-xs text-gray-400 mt-1 italic">Based on your zip code</p>
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Price Range" open={openSections.price} onToggle={() => toggleSection("price")}>
        <PriceSlider
          min={filters.minPrice}
          max={filters.maxPrice}
          onMinChange={(v) => setFilters((prev) => ({ ...prev, minPrice: v }))}
          onMaxChange={(v) => setFilters((prev) => ({ ...prev, maxPrice: v }))}
        />
      </Section>

      {/* Farm Certifications */}
      <Section title="Farm Certifications" open={openSections.certifications} onToggle={() => toggleSection("certifications")}>
        <div className="space-y-2">
          {CERTIFICATIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.certifications.includes(cert)}
                onChange={() => toggleCheckbox("certifications", cert)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.certifications.includes(cert) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {cert}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Rating" open={openSections.rating} onToggle={() => toggleSection("rating")}>
        <div className="space-y-2">
          {[{ label: "4 stars and up", stars: 4 }, { label: "3 stars and up", stars: 3 }, { label: "2 stars and up", stars: 2 }, { label: "Any rating", stars: 0 }].map(({ label, stars }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="filter-rating"
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
          {AVAILABILITY.map((item) => (
            <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.availability.includes(item)}
                onChange={() => toggleCheckbox("availability", item)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.availability.includes(item) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Farm */}
      <Section title="Farm" open={openSections.farms} onToggle={() => toggleSection("farms")}>
        <div className="mb-2">
          <input
            type="search"
            value={filters.farmSearch}
            onChange={(e) => setFilters((prev) => ({ ...prev, farmSearch: e.target.value }))}
            placeholder="Search farms..."
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a4a2e] bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          {FARMS.filter((f) => f.toLowerCase().includes(filters.farmSearch.toLowerCase())).map((farm) => (
            <label key={farm} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.farms.includes(farm)}
                onChange={() => toggleCheckbox("farms", farm)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e] cursor-pointer"
              />
              <span className={`text-sm ${filters.farms.includes(farm) ? "text-[#1a4a2e] font-medium" : "text-gray-700 group-hover:text-gray-900"}`}>
                {farm}
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

// ─── Main FilterSidebar ───────────────────────────────────────────────────────

export default function FilterSidebar() {
  const { activeCount } = useFilterContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile trigger button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-[#1a4a2e] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900">Filters</h2>
          </div>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
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
                  Filters{activeCount > 0 ? ` (${activeCount})` : ""}
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
