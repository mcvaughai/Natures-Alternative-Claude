import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Heirloom Tomatoes (2lb)",       price: "$5.99",  description: "Assorted heirloom tomatoes. Sun-ripened for deep flavor. No synthetic pesticides." },
  { id: 2,  name: "Mixed Salad Greens (5oz)",      price: "$4.49",  description: "Baby arugula, spinach, and mixed lettuces. Harvested the morning of delivery." },
  { id: 3,  name: "Organic Blueberries (1 pint)",  price: "$6.99",  description: "Plump, sweet blueberries grown without synthetic pesticides. Picked at peak ripeness." },
  { id: 4,  name: "Rainbow Carrots (1lb)",         price: "$3.99",  description: "Purple, yellow, and orange carrots. Sweet and crunchy, freshly pulled." },
  { id: 5,  name: "Sunflower Microgreens (4oz)",   price: "$5.49",  description: "Tender sunflower microgreens. Nutty flavor, packed with nutrients." },
  { id: 6,  name: "Shiitake Mushrooms (8oz)",      price: "$7.99",  description: "Fresh shiitake mushrooms. Earthy, meaty, grown on oak logs." },
  { id: 7,  name: "Zucchini (3pk)",                price: "$4.99",  description: "Freshly harvested summer zucchini. Tender skin, sweet flesh." },
  { id: 8,  name: "Strawberries (1 pint)",         price: "$5.99",  description: "Fragrant, sweet strawberries. Grown without synthetic chemicals." },
  { id: 9,  name: "Baby Potatoes (1.5lb)",         price: "$4.49",  description: "Mixed baby potatoes — red, gold, and purple. Creamy and buttery." },
  { id: 10, name: "Kale Bunch",                    price: "$3.49",  description: "Lacinato (dinosaur) kale. Tender, dark green, full of vitamins." },
  { id: 11, name: "Seasonal Veggie Box",           price: "$24.99", description: "Weekly curated box of whatever is freshest from the farm. 8–10 items." },
  { id: 12, name: "Pea Shoots (4oz)",              price: "$4.99",  description: "Sweet, tender pea shoot microgreens. Great in salads and stir fries." },
];

export default function FruitsVegetablesPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Fruits & Vegetables</h1>
            <p className="text-[#f5f0e8] opacity-90">Fresh, seasonal produce grown without synthetic pesticides — straight from the farm</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="fruits-vegetables" />
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
