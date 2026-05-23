import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Grass-Fed Ground Beef (1lb)",    price: "$8.99",  description: "100% grass-fed and finished ground beef from pasture-raised cattle. 85/15 blend." },
  { id: 2,  name: "Pasture-Raised Whole Chicken",   price: "$18.99", description: "Whole pasture-raised chicken, air-chilled. No antibiotics or added hormones." },
  { id: 3,  name: "Heritage Pork Chops (2pk)",      price: "$14.99", description: "Bone-in pork chops from heritage-breed hogs raised on open pasture. Rich flavor." },
  { id: 4,  name: "Lamb Shoulder Roast",            price: "$22.99", description: "Bone-in lamb shoulder from grass-fed lamb. Perfect for slow roasting." },
  { id: 5,  name: "Pastured Turkey Breast",         price: "$16.99", description: "Boneless turkey breast from free-range heritage turkey. Lean and flavorful." },
  { id: 6,  name: "Duck Legs (2pk)",                price: "$19.99", description: "Slow-raised duck legs. Rich in flavor, perfect for confit or braising." },
  { id: 7,  name: "Breakfast Sausage Links (1lb)",  price: "$10.99", description: "Pork breakfast sausage with sage and fennel. No fillers, no nitrates." },
  { id: 8,  name: "Beef Ribeye Steak",              price: "$28.99", description: "1-inch grass-fed ribeye. Dry-aged 14 days for deep beefy flavor." },
  { id: 9,  name: "Chicken Thighs Bone-In (4pk)",   price: "$12.99", description: "Pasture-raised bone-in chicken thighs. Juicy and full of flavor." },
  { id: 10, name: "Pasture Pork Belly (1lb)",       price: "$11.99", description: "Heritage-breed pork belly. Cure it, roast it, or slice for bacon." },
  { id: 11, name: "Goat Stew Meat (1lb)",           price: "$13.99", description: "Pasture-raised goat stew meat. Lean, flavorful, ideal for slow cooking." },
  { id: 12, name: "Smoked Andouille Sausage",       price: "$12.99", description: "Cajun-spiced smoked pork sausage. Made with heritage pork and natural casings." },
];

export default function MeatPoultryPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Meat & Poultry</h1>
            <p className="text-[#f5f0e8] opacity-90">Pasture-raised, grass-fed meats from local farms with no antibiotics or hormones</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="meat-poultry" />
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
