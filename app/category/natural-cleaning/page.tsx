import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "All-Purpose Citrus Cleaner",   price: "$10.99", description: "Plant-based all-purpose spray with orange peel extract. Non-toxic, biodegradable." },
  { id: 2,  name: "Castile Dish Soap",             price: "$9.99",  description: "Concentrated castile soap with tea tree and eucalyptus. Cuts grease naturally." },
  { id: 3,  name: "Laundry Powder",                price: "$14.99", description: "Soap nut and washing soda laundry powder. Effective in cold water. 40 washes." },
  { id: 4,  name: "Bathroom Scrub Powder",         price: "$8.99",  description: "Baking soda and borax scrubbing powder with lavender. Cleans tile and grout." },
  { id: 5,  name: "Vinegar Floor Cleaner",         price: "$7.99",  description: "White vinegar concentrate with thyme essential oil. Safe for most hard floors." },
  { id: 6,  name: "Oxygen Brightener",             price: "$12.99", description: "Sodium percarbonate brightener. Whitens without chlorine bleach. Biodegradable." },
  { id: 7,  name: "Lemon Concentrate Cleaner",     price: "$11.99", description: "Versatile lemon oil concentrate — dilute for dozens of cleaning tasks." },
  { id: 8,  name: "Compostable Cleaning Cloths",   price: "$13.99", description: "Pack of 10 plant-fiber cleaning cloths. Replaces paper towels. Compostable." },
  { id: 9,  name: "Natural Air Purifier Spray",    price: "$9.99",  description: "Purifying mist with activated charcoal and essential oils. Neutralizes odors." },
  { id: 10, name: "Dish Soap Bar",                 price: "$6.99",  description: "Solid dish soap bar with coconut oil and clove. Zero-waste, long-lasting." },
];

export default function NaturalCleaningPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Natural Cleaning</h1>
            <p className="text-[#f5f0e8] opacity-90">Plant-based, biodegradable cleaning products safe for your home and the planet</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar />
              <div className="flex-1 min-w-0">
                <ActiveFiltersBar />
                <GridHeader resultCount={MOCK_PRODUCTS.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {MOCK_PRODUCTS.map((product) => (
                    <ProductCard key={product.id} id={product.id} name={product.name} price={product.price} description={product.description} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {[1, 2].map((page) => (
                    <button key={page} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === 1 ? "bg-[#1a4a2e] text-white" : "border border-gray-200 text-gray-600 hover:border-[#1a4a2e] hover:text-[#1a4a2e]"}`}>{page}</button>
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
