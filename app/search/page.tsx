import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";

interface SearchPageProps {
  searchParams: { q?: string };
}

const MOCK_PRODUCTS = [
  { id: 1,  name: "Grass Fed Ground Beef",      price: "$14.99", description: "100% grass fed beef from pasture raised cattle. No hormones or antibiotics." },
  { id: 2,  name: "Heritage Pork Chops",         price: "$18.99", description: "Heritage breed pork raised on open pasture with natural feed." },
  { id: 3,  name: "Farm Fresh Eggs (1 Dozen)",   price: "$7.99",  description: "Free range eggs from hens raised on pasture. Collected daily." },
  { id: 4,  name: "Heirloom Tomatoes (2 lbs)",   price: "$6.99",  description: "Mixed heirloom varieties grown without synthetic pesticides." },
  { id: 5,  name: "Raw Wildflower Honey (1 lb)", price: "$12.99", description: "Unfiltered raw honey from natural wildflower meadows." },
  { id: 6,  name: "Whole Pastured Chicken",      price: "$22.99", description: "Pasture raised chicken processed fresh to order." },
  { id: 7,  name: "Sweet Corn (6 ears)",         price: "$5.99",  description: "Non-GMO sweet corn harvested at peak ripeness." },
  { id: 8,  name: "Organic Salad Mix (8 oz)",    price: "$4.99",  description: "Freshly harvested salad greens grown without chemicals." },
  { id: 9,  name: "Goat Cheese (4 oz)",          price: "$9.99",  description: "Artisan goat cheese from grass fed goats. Creamy and mild." },
  { id: 10, name: "Bone-In Ribeye Steak",        price: "$34.99", description: "Thick cut ribeye from grass fed cattle. Dry aged 14 days." },
  { id: 11, name: "Butternut Squash",            price: "$4.49",  description: "Organically grown butternut squash harvested at full maturity." },
  { id: 12, name: "Fresh Herb Bundle",           price: "$3.99",  description: "Seasonal herb bundle including basil, thyme, and rosemary." },
];

const CATEGORIES = [
  { label: "Fruits & Vegetables", count: 12 },
  { label: "Meat & Poultry",      count: 6 },
  { label: "Dairy & Eggs",        count: 4 },
  { label: "Seafood",             count: 2 },
];

const FARMS = [
  "Example Farms",
  "Purple Food Crew",
  "Force of Nature",
  "W&W Farms",
];

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? "";

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Search Header ─────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {query ? (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Search Results for: <span className="text-[#1a4a2e]">&quot;{query}&quot;</span>
                  </h1>
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Products</h1>
                )}
                <p className="text-sm text-gray-500 mt-1">Showing {MOCK_PRODUCTS.length} results</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/20">
                  <option>Relevance</option>
                  <option>Price Low to High</option>
                  <option>Price High to Low</option>
                  <option>Newest</option>
                  <option>Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column Layout ────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left — Filters */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900">Filters</h2>
                  <button className="text-sm text-[#1a4a2e] hover:underline">Clear All</button>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <label key={cat.label} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e]" />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.label}</span>
                        </div>
                        <span className="text-xs text-gray-400">({cat.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {["Under $10", "$10 - $25", "$25 - $50", "Over $50"].map((range) => (
                      <label key={range} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e]" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fulfillment */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fulfillment</h3>
                  <div className="space-y-2">
                    {["Farm Pickup", "Local Delivery", "Shipping"].map((method) => (
                      <label key={method} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e]" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rating</h3>
                  <div className="space-y-2">
                    {["4 stars and up", "3 stars and up"].map((rating) => (
                      <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e]" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{rating}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Farm */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Farm</h3>
                  <div className="space-y-2">
                    {FARMS.map((farm) => (
                      <label key={farm} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1a4a2e]" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{farm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-[#1a4a2e] hover:bg-[#143d24] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Right — Results Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {MOCK_PRODUCTS.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    description={product.description}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-10">
                <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === 1
                        ? "bg-[#1a4a2e] text-white"
                        : "border border-gray-200 text-gray-600 hover:border-[#1a4a2e] hover:text-[#1a4a2e]"
                    }`}
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
        </div>

      </main>
      <Footer />
    </div>
  );
}
