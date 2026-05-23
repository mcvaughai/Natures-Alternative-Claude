import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Gulf Red Snapper Fillet",       price: "$18.99", description: "Fresh wild-caught red snapper fillet. Mild, flaky, and versatile." },
  { id: 2,  name: "Wild Gulf Shrimp (1lb)",        price: "$16.99", description: "Fresh wild-caught Gulf shrimp. Sweet, firm, and sustainably harvested." },
  { id: 3,  name: "Smoked Salmon (4oz)",           price: "$14.99", description: "Cold-smoked wild salmon. Rich flavor, silky texture. No artificial preservatives." },
  { id: 4,  name: "Whole Blue Crab (2pk)",         price: "$19.99", description: "Live-cooked whole blue crab. Harvested from Gulf waters, sweet and tender." },
  { id: 5,  name: "Cajun Dried Shrimp (4oz)",      price: "$9.99",  description: "Sun-dried Gulf shrimp with Cajun seasoning. Intense flavor for soups and rice." },
  { id: 6,  name: "Catfish Fillets (1lb)",         price: "$11.99", description: "Farm-raised catfish fillets. Clean, mild flavor. No antibiotics." },
  { id: 7,  name: "Smoked Gulf Oysters (4oz)",     price: "$12.99", description: "Smoked Gulf Coast oysters in olive oil. Rich, briny, and deeply savory." },
  { id: 8,  name: "Crab Claws (1lb)",              price: "$22.99", description: "Pre-cracked stone crab claws. Sweet and buttery. Ready to eat." },
];

export default function SeafoodPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Seafood</h1>
            <p className="text-[#f5f0e8] opacity-90">Wild-caught and sustainably harvested seafood from local fishermen</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="seafood" />
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
                  {[1].map((page) => (
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
