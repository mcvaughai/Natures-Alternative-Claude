import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Raw Whole Milk (half gallon)",  price: "$7.99",  description: "Fresh raw whole milk from 100% grass-fed cows. Non-homogenized, full-fat." },
  { id: 2,  name: "Pastured Dozen Eggs",           price: "$6.49",  description: "A dozen eggs from free-range hens on pasture. Deep orange yolks." },
  { id: 3,  name: "Farmstead Cheddar (8oz)",       price: "$11.99", description: "Aged raw milk cheddar from grass-fed cows. Sharp, crumbly, complex flavor." },
  { id: 4,  name: "Cultured Butter (8oz)",         price: "$8.99",  description: "European-style cultured butter. Made from pastured cream. Rich and tangy." },
  { id: 5,  name: "Plain Whole Milk Yogurt (16oz)",price: "$6.99",  description: "Thick, creamy whole-milk yogurt. Live active cultures, no added thickeners." },
  { id: 6,  name: "Duck Eggs (half dozen)",        price: "$8.99",  description: "Half dozen duck eggs. Rich, larger yolk, excellent for baking and custards." },
  { id: 7,  name: "Kefir (quart)",                 price: "$7.49",  description: "Drinkable cultured kefir. Loaded with probiotics, tangy and refreshing." },
  { id: 8,  name: "Heavy Cream (pint)",            price: "$6.99",  description: "Pastured heavy cream, non-homogenized. Perfect for whipping or cooking." },
  { id: 9,  name: "Goat Milk (quart)",             price: "$8.49",  description: "Fresh goat milk from small dairy herd. Naturally A2, easy to digest." },
  { id: 10, name: "Aged Gouda (6oz)",              price: "$13.99", description: "12-month aged raw goat's milk gouda. Caramel notes, firm texture." },
  { id: 11, name: "Quail Eggs (18pk)",             price: "$9.99",  description: "Fresh quail eggs from pastured birds. Delicate flavor, perfect bite-size." },
  { id: 12, name: "Cottage Cheese (16oz)",         price: "$5.99",  description: "Small-curd whole-milk cottage cheese. Made fresh from local dairy." },
];

export default function DairyEggsPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Dairy & Eggs</h1>
            <p className="text-[#f5f0e8] opacity-90">Fresh dairy and eggs from pasture-raised animals — no hormones, no fillers</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="dairy-eggs" />
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
