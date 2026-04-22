import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import StoreCard from "@/components/shared/StoreCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

interface CategoryPageProps {
  params: { slug: string };
}

function getCategoryName(slug: string): string {
  const names: Record<string, string> = {
    "meat-poultry":      "Meat & Poultry",
    "fruits-vegetables": "Fruits & Vegetables",
    "dairy-eggs":        "Dairy & Eggs",
    "seafood":           "Seafood",
    "bakery-breads":     "Bakery & Breads",
    "honey-preserves":   "Honey & Preserves",
    "herbs-botanicals":  "Herbs & Botanicals",
  };
  return names[slug] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const MOCK_PRODUCTS = [
  { id: 1,  name: "Heirloom Tomatoes (2 lbs)",   price: "$6.99",  description: "Mixed heirloom varieties grown without synthetic pesticides. Sun ripened." },
  { id: 2,  name: "Sweet Corn (6 ears)",          price: "$5.99",  description: "Non-GMO sweet corn harvested at peak ripeness from local fields." },
  { id: 3,  name: "Organic Salad Mix (8 oz)",     price: "$4.99",  description: "Freshly harvested salad greens grown without chemicals or additives." },
  { id: 4,  name: "Butternut Squash",             price: "$4.49",  description: "Organically grown butternut squash harvested at full maturity." },
  { id: 5,  name: "Rainbow Chard Bundle",         price: "$3.99",  description: "Vibrant rainbow chard grown in rich organic soil without pesticides." },
  { id: 6,  name: "Cucumber (3 pack)",            price: "$3.49",  description: "Crisp unwaxed cucumbers grown naturally in open air gardens." },
  { id: 7,  name: "Yellow Onions (3 lbs)",        price: "$4.29",  description: "Naturally grown yellow storage onions, cured and ready to use." },
  { id: 8,  name: "Baby Potatoes (2 lbs)",        price: "$5.49",  description: "Tender baby potatoes grown in chemical free soil. Ready to roast." },
  { id: 9,  name: "Green Beans (1 lb)",           price: "$3.99",  description: "Fresh picked green beans from open air rows. Snap crisp and sweet." },
  { id: 10, name: "Bell Peppers (4 pack)",        price: "$5.99",  description: "Mixed color bell peppers grown without GMOs or synthetic inputs." },
  { id: 11, name: "Zucchini (2 pack)",            price: "$3.79",  description: "Tender summer zucchini harvested young for the best flavor." },
  { id: 12, name: "Strawberries (1 pint)",        price: "$6.49",  description: "Sweet and fragrant strawberries grown without pesticides." },
  { id: 13, name: "Blueberries (1 pint)",         price: "$7.99",  description: "Plump wild blueberries from natural low-spray bushes." },
  { id: 14, name: "Watermelon (whole)",           price: "$12.99", description: "Seeded heirloom watermelon variety. Exceptionally sweet and juicy." },
  { id: 15, name: "Peaches (4 pack)",             price: "$6.99",  description: "Tree ripened peaches from a small Texas orchard. No wax coating." },
  { id: 16, name: "Fresh Herb Bundle",            price: "$3.99",  description: "Seasonal herb bundle including basil, thyme, and rosemary." },
];

const FARMS = [
  { id: "example-farms",    name: "Example Farms",    tagline: "Pasture raised meats and seasonal vegetables from the Texas Hill Country." },
  { id: "purple-food-crew", name: "Purple Food Crew", tagline: "Specialty produce and rare heirloom varieties grown without chemicals." },
  { id: "ww-farms",         name: "W&W Farms",        tagline: "Family owned farm offering seasonal vegetables and free range eggs." },
  { id: "green-acres",      name: "Green Acres",      tagline: "Certified natural produce farm serving the greater Houston area." },
];

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const categoryName = getCategoryName(slug);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Category Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{categoryName}</h1>
            <p className="text-[#f5f0e8] opacity-90">Fresh from local natural farms near you</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sidebar */}
              <FilterSidebar />

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <ActiveFiltersBar />
                <GridHeader resultCount={MOCK_PRODUCTS.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {MOCK_PRODUCTS.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      description={product.description}
                    />
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

        {/* Farms in This Category */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Farms Selling {categoryName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FARMS.map((farm) => (
              <StoreCard key={farm.id} id={farm.id} name={farm.name} tagline={farm.tagline} />
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
