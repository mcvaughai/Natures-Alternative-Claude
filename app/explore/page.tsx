import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/marketplace/HeroBanner";
import ProductCard from "@/components/shared/ProductCard";
import TopRated from "@/components/explore/TopRated";
import AdBanner from "@/components/explore/AdBanner";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const PRODUCTS = [
  { id: 1,  name: "Pancakes",             price: "$7.99",  description: "Fluffy buttermilk pancake mix made from stone-ground heirloom wheat." },
  { id: 2,  name: "Organic Tomatoes",     price: "$3.99",  description: "Sun-ripened organic tomatoes harvested fresh from local farms." },
  { id: 3,  name: "Heirloom Apples",      price: "$5.49",  description: "Crisp heirloom apple varieties grown without synthetic pesticides." },
  { id: 4,  name: "Wild Honey",           price: "$12.99", description: "Pure unfiltered wildflower honey harvested from our apiaries, 16 oz." },
  { id: 5,  name: "Free Range Eggs",      price: "$6.49",  description: "A dozen farm-fresh eggs from pasture-raised, free-roaming hens." },
  { id: 6,  name: "Sweet Potatoes",       price: "$3.79",  description: "Naturally sweet, nutrient-dense potatoes dug fresh from rich garden soil." },
  { id: 7,  name: "Grass-Fed Beef",       price: "$9.99",  description: "100% grass-fed and finished ground beef, 1 lb vacuum-sealed pack." },
  { id: 8,  name: "Baby Kale",            price: "$4.29",  description: "Tender baby kale leaves packed with vitamins, ready to eat or cook." },
  { id: 9,  name: "Strawberries",         price: "$5.99",  description: "Plump, vine-ripened strawberries picked at peak sweetness." },
  { id: 10, name: "Blueberries",          price: "$6.49",  description: "Fresh-picked blueberries bursting with antioxidants and flavor." },
  { id: 11, name: "Sourdough Loaf",       price: "$8.49",  description: "Long-fermented sourdough baked in a stone oven with local heritage wheat." },
  { id: 12, name: "Goat Cheese",          price: "$7.99",  description: "Creamy chèvre-style goat cheese made fresh at a nearby family dairy." },
  { id: 13, name: "Zucchini",             price: "$2.99",  description: "Tender summer zucchini harvested young for the best flavor and texture." },
  { id: 14, name: "Rainbow Carrots",      price: "$3.49",  description: "A colorful mix of heirloom carrot varieties, sweet and earthy." },
  { id: 15, name: "Heritage Pork Chops",  price: "$11.99", description: "Bone-in chops from heritage-breed hogs raised on open pasture." },
  { id: 16, name: "Wild Salmon Fillet",   price: "$14.99", description: "Wild-caught Pacific salmon, skin-on fillet, sustainably harvested." },
  { id: 17, name: "Mushroom Mix",         price: "$5.29",  description: "Seasonal blend of chanterelle, oyster, and shiitake mushrooms." },
  { id: 18, name: "Bell Peppers",         price: "$3.99",  description: "Mixed red, yellow, and orange sweet bell peppers, vine-ripened." },
  { id: 19, name: "Raw Wildflower Honey", price: "$13.99", description: "Single-source raw honey with no filtering. Full pollen and enzymes intact." },
  { id: 20, name: "Sourdough Crackers",   price: "$5.99",  description: "Long-fermented sourdough crackers baked with sea salt and rosemary." },
  { id: 21, name: "Fresh Herb Bundle",    price: "$3.99",  description: "Seasonal herb bundle: basil, thyme, rosemary, and sage." },
  { id: 22, name: "Duck Eggs (6 pack)",   price: "$8.49",  description: "Rich-yolked duck eggs from pastured ducks. Great for baking." },
  { id: 23, name: "Lamb Chops",           price: "$15.99", description: "Loin chops from pasture-raised lamb. Tender and full of flavor." },
  { id: 24, name: "Elderflower Syrup",    price: "$9.99",  description: "Handcrafted elderflower syrup made with real blossoms. No preservatives." },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sidebar */}
              <FilterSidebar />

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <ActiveFiltersBar />
                <GridHeader resultCount={PRODUCTS.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {PRODUCTS.map((p) => (
                    <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} description={p.description} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button key={page} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === 1 ? "bg-[#1a4a2e] text-white" : "border border-gray-200 text-gray-600 hover:border-[#1a4a2e] hover:text-[#1a4a2e]"}`}>
                      {page}
                    </button>
                  ))}
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-[#1a4a2e] hover:text-[#1a4a2e] flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </FilterProvider>
        </div>

        <TopRated />
        <AdBanner />
      </main>
      <Footer />
    </div>
  );
}
