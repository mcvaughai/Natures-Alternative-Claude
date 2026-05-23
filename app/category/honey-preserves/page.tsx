import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Raw Wildflower Honey (16oz)",   price: "$12.99", description: "Pure unfiltered wildflower honey. Never heated above 95°F. Glass jar." },
  { id: 2,  name: "Strawberry Jam (8oz)",          price: "$7.99",  description: "Small-batch strawberry jam. Real fruit, cane sugar, no pectin or preservatives." },
  { id: 3,  name: "Fermented Hot Sauce (5oz)",     price: "$9.99",  description: "Lacto-fermented cayenne hot sauce. Bright, tangy, and complex. No vinegar." },
  { id: 4,  name: "Bread & Butter Pickles (16oz)", price: "$8.49",  description: "Sweet and tangy cucumber pickles. Small-batch, no artificial dyes." },
  { id: 5,  name: "Jalapeño Pepper Jelly (8oz)",   price: "$8.99",  description: "Sweet-heat jalapeño jelly. Perfect with cheese or as a glaze." },
  { id: 6,  name: "Sorghum Syrup (12oz)",          price: "$10.99", description: "Old-fashioned sorghum syrup. Smoky-sweet, mineral-rich natural sweetener." },
  { id: 7,  name: "Creamed Clover Honey (12oz)",   price: "$11.99", description: "Whipped creamed honey from clover blossoms. Spreadable, silky smooth." },
  { id: 8,  name: "Blueberry Preserves (8oz)",     price: "$8.49",  description: "Chunky blueberry preserves with lemon zest. Minimal sugar, maximum fruit." },
  { id: 9,  name: "Kimchi (16oz)",                 price: "$10.99", description: "Traditionally fermented napa cabbage kimchi. Probiotic-rich and spicy." },
  { id: 10, name: "Tomato Basil Sauce (16oz)",     price: "$9.99",  description: "Fresh-cooked tomato sauce with basil and garlic. No added sugar or fillers." },
  { id: 11, name: "Dill Pickles (32oz)",           price: "$9.49",  description: "Crisp whole dill pickles. Garlic, fresh dill, and no artificial preservatives." },
  { id: 12, name: "Blackberry Jam (8oz)",          price: "$8.49",  description: "Wild blackberry jam with a hint of lemon. Seeded, bold, and fruity." },
];

export default function HoneyPreservesPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Honey & Preserves</h1>
            <p className="text-[#f5f0e8] opacity-90">Raw honey, small-batch jams, fermented foods, and natural condiments</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="honey-preserves" />
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
