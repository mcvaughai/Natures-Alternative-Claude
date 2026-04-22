import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Beeswax Pillar Candle",      price: "$16.99", description: "Pure beeswax pillar candle. Naturally golden, slow-burning, and honey-scented." },
  { id: 2,  name: "Lavender Soy Candle",         price: "$14.99", description: "Hand-poured soy wax candle with dried lavender buds. 40-hour burn time." },
  { id: 3,  name: "Tallow Taper Candles (4pk)",  price: "$12.99", description: "Traditional grass-fed tallow taper candles. Clean burn, no synthetic additives." },
  { id: 4,  name: "Cedar & Pine Reed Diffuser",  price: "$22.99", description: "Natural reed diffuser with cedar, pine, and bergamot essential oils. 90ml." },
  { id: 5,  name: "Linen & Herb Room Spray",     price: "$11.99", description: "Refreshing room spray with lavender, eucalyptus, and clean linen notes." },
  { id: 6,  name: "Dried Wildflower Bouquet",    price: "$18.99", description: "Foraged and dried wildflower arrangement. Long-lasting natural home decor." },
  { id: 7,  name: "Beeswax Honeycomb Sheet Kit", price: "$19.99", description: "Make-your-own candle kit with beeswax honeycomb sheets and cotton wicks." },
  { id: 8,  name: "Beeswax Food Wraps (3pk)",    price: "$15.99", description: "Reusable beeswax wraps for food storage. Replaces plastic wrap sustainably." },
  { id: 9,  name: "Eucalyptus Soy Candle",       price: "$13.99", description: "Soy wax candle with pure eucalyptus essential oil. Clears and refreshes." },
  { id: 10, name: "Dried Herb Wreath",           price: "$24.99", description: "Hand-assembled wreath of rosemary, lavender, and sage. Fragrant home decor." },
  { id: 11, name: "Citrus Zest Room Spray",      price: "$10.99", description: "Uplifting room mist with sweet orange, lemon, and grapefruit essential oils." },
  { id: 12, name: "Pressed Flower Candle Set",   price: "$29.99", description: "Set of 3 soy candles with real pressed flowers embedded in the wax." },
];

export default function CandlesHomePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Candles & Home</h1>
            <p className="text-[#f5f0e8] opacity-90">Natural candles, home fragrance, and eco-friendly home goods</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="candles-home" />
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
