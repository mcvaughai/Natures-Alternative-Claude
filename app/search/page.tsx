import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

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

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? "";

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {query ? (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Search Results for: <span className="text-[#1a4a2e]">&quot;{query}&quot;</span>
              </h1>
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Products</h1>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sidebar */}
              <FilterSidebar />

              {/* Results */}
              <div className="flex-1 min-w-0">
                <ActiveFiltersBar />
                <GridHeader resultCount={MOCK_PRODUCTS.length} />
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button key={page} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === 1 ? "bg-[#1a4a2e] text-white" : "border border-gray-200 text-gray-600 hover:border-[#1a4a2e] hover:text-[#1a4a2e]"}`}>
                      {page}
                    </button>
                  ))}
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </FilterProvider>
        </div>

      </main>
      <Footer />
    </div>
  );
}
