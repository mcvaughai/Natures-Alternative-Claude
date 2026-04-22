import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const MOCK_PRODUCTS = [
  { id: 1,  name: "Rosehip Face Serum",        price: "$24.99", description: "Cold-pressed rosehip oil with vitamin C. Brightens and firms skin naturally." },
  { id: 2,  name: "Whipped Shea Body Butter",  price: "$18.99", description: "Hand-whipped unrefined shea butter with lavender essential oil. Deep moisture." },
  { id: 3,  name: "Activated Charcoal Soap",   price: "$8.99",  description: "Handmade bar soap with activated charcoal and tea tree. Detoxifying cleanse." },
  { id: 4,  name: "Beeswax Lip Balm",          price: "$5.99",  description: "Pure beeswax lip balm with honey and peppermint. No synthetic ingredients." },
  { id: 5,  name: "Aloe Vera Gel",             price: "$12.99", description: "Pure organic aloe vera gel. Soothes sunburn, hydrates, and calms skin." },
  { id: 6,  name: "Clay Face Mask",            price: "$15.99", description: "Kaolin and bentonite clay mask with botanicals. Deep pore cleansing." },
  { id: 7,  name: "Natural Deodorant Stick",   price: "$11.99", description: "Baking soda-free formula with arrowroot, shea, and magnesium. 48hr protection." },
  { id: 8,  name: "Argan Hair Oil",            price: "$19.99", description: "Pure cold-pressed argan oil for frizz control and shine. A few drops go far." },
  { id: 9,  name: "Oat Milk Toner",            price: "$16.99", description: "Calming toner made with colloidal oatmeal and rosewater. Sensitive skin friendly." },
  { id: 10, name: "Coffee Body Scrub",         price: "$14.99", description: "Fresh-ground coffee with coconut oil and raw sugar. Exfoliates and energizes." },
  { id: 11, name: "Herbal Face Steam",         price: "$9.99",  description: "Dried herb blend for facial steam: chamomile, lavender, and calendula." },
  { id: 12, name: "Baby Lotion",               price: "$13.99", description: "Fragrance-free gentle lotion for baby skin. Calendula and sunflower oil." },
  { id: 13, name: "Vitamin C Moisturizer",     price: "$22.99", description: "Natural vitamin C from rosehip and sea buckthorn. Brightens and protects." },
  { id: 14, name: "Lavender Facial Mist",      price: "$10.99", description: "Hydrating mist with lavender hydrosol and aloe. Refresh anytime, anywhere." },
  { id: 15, name: "Jojoba Cleansing Oil",      price: "$17.99", description: "Oil cleansing method blend with jojoba, castor, and sunflower. Makeup-removing." },
  { id: 16, name: "Mineral Sunscreen SPF 30",  price: "$21.99", description: "Zinc oxide sunscreen with no chemical filters. Reef-safe and tinted." },
];

export default function NaturalSkincarePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Natural Skincare</h1>
            <p className="text-[#f5f0e8] opacity-90">Pure, handcrafted skincare made with natural and organic ingredients</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category="natural-skincare" />
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
                  {[1, 2, 3].map((page) => (
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
