import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Fresh Basil Bunch",              price: "$2.99",  description: "Fragrant Genovese basil, hand-cut and bunched to order. Perfect for pesto." },
  { id: 2,  name: "Dried Lavender (1oz)",           price: "$5.99",  description: "Organically grown dried culinary lavender. For baking, teas, and aromatherapy." },
  { id: 3,  name: "Chamomile Tea Blend (2oz)",      price: "$8.99",  description: "Whole chamomile flowers blended with lemon balm. Calming, floral, caffeine-free." },
  { id: 4,  name: "Elderberry Tincture (1oz)",      price: "$16.99", description: "Wild-harvested elderberry tincture in organic cane alcohol. Immune support." },
  { id: 5,  name: "Lavender Essential Oil (10ml)",  price: "$12.99", description: "Steam-distilled lavender essential oil. Therapeutic grade, 100% pure." },
  { id: 6,  name: "Fresh Rosemary Bunch",           price: "$2.49",  description: "Woody rosemary sprigs. Freshly harvested. Great for roasting and infusions." },
  { id: 7,  name: "Dried Herb Blend (1oz)",         price: "$6.99",  description: "Italian herb blend: oregano, thyme, basil, and rosemary. Stone-dried." },
  { id: 8,  name: "Peppermint Tea (2oz)",           price: "$7.99",  description: "Dried peppermint leaf tea. Cooling, bright, and refreshing. Caffeine-free." },
  { id: 9,  name: "Echinacea Tincture (1oz)",       price: "$14.99", description: "Organically grown echinacea root tincture. Traditional immune herb." },
  { id: 10, name: "Eucalyptus Oil (10ml)",          price: "$11.99", description: "Pure eucalyptus essential oil. Invigorating, clarifying, great for diffusers." },
  { id: 11, name: "Fresh Thyme Bunch",              price: "$2.49",  description: "Freshly cut garden thyme. Fragrant, woody, perfect for cooking and teas." },
  { id: 12, name: "Tulsi Holy Basil Tea (2oz)",     price: "$9.99",  description: "Adaptogenic holy basil leaf tea. Earthy, clove-like. Stress and energy support." },
];

export default function HerbsBotanicalsPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Herbs & Botanicals</h1>
            <p className="text-[#f5f0e8] opacity-90">Fresh herbs, dried botanicals, herbal teas, and plant-based tinctures and oils</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="herbs-botanicals" />
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
