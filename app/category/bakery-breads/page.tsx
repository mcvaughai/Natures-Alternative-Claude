import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Country Sourdough Loaf",        price: "$9.99",  description: "Classic country sourdough. Long fermented 24hr, open crumb, crackling crust." },
  { id: 2,  name: "Whole Wheat Sandwich Loaf",     price: "$8.49",  description: "Soft whole wheat sandwich bread. Stone-milled flour, no preservatives." },
  { id: 3,  name: "Almond Croissants (2pk)",       price: "$7.99",  description: "Buttery croissants filled with almond frangipane. Laminated with real butter." },
  { id: 4,  name: "Flour Tortillas (8pk)",         price: "$5.99",  description: "Hand-pressed flour tortillas. Lard-based, soft and pliable. No preservatives." },
  { id: 5,  name: "Granola (12oz)",                price: "$10.99", description: "Oat and honey granola with pecans and dried cranberries. Baked in small batches." },
  { id: 6,  name: "Stone Ground Rye Flour (2lb)",  price: "$7.99",  description: "Whole grain rye flour, stone milled. Rich, earthy flavor. Great for breads." },
  { id: 7,  name: "Einkorn Sourdough Loaf",        price: "$11.99", description: "Ancient grain sourdough made with 100% einkorn wheat. Nutty, deeply flavorful." },
  { id: 8,  name: "Cinnamon Raisin Bread",         price: "$9.49",  description: "Soft cinnamon swirl loaf with plump raisins. Made with stone-milled flour." },
  { id: 9,  name: "Corn Tortillas (12pk)",         price: "$4.99",  description: "Freshly made masa tortillas. Non-GMO corn, stone-ground and pressed to order." },
  { id: 10, name: "Maple Pecan Granola (12oz)",    price: "$11.99", description: "Maple-sweetened granola with toasted pecans and pumpkin seeds. No refined sugar." },
  { id: 11, name: "Seeded Rye Loaf",               price: "$10.49", description: "Dark rye sourdough with caraway, sesame, and sunflower seeds." },
  { id: 12, name: "Blueberry Scones (4pk)",        price: "$8.99",  description: "Tender buttermilk scones loaded with wild blueberries. No artificial flavors." },
];

export default function BakeryBreadsPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Bakery & Breads</h1>
            <p className="text-[#f5f0e8] opacity-90">Artisan breads, pastries, and baked goods made with whole grains and real ingredients</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="bakery-breads" />
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
