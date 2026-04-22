import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreNavbar from "@/components/store/StoreNavbar";
import ShopHeroBanner from "@/components/store/ShopHeroBanner";
import ProductCategorySection from "@/components/store/ProductCategorySection";
import Pagination from "@/components/explore/Pagination";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";

const BEST_SELLERS = [
  { id: 101, name: "Fresh Tomatoes",       description: "Vine-ripened heirloom tomatoes bursting with flavour, picked at peak ripeness.", price: "$3.99" },
  { id: 102, name: "Organic Carrots",      description: "Sweet, crunchy carrots grown without pesticides in rich, loamy soil.", price: "$2.49" },
  { id: 103, name: "Free-Range Eggs",      description: "A dozen large eggs from pasture-raised hens. Rich orange yolks every time.", price: "$5.99" },
  { id: 104, name: "Raw Honey",            description: "Wildflower honey harvested from our on-site hives. Unfiltered and unheated.", price: "$8.99" },
  { id: 105, name: "Sourdough Loaf",       description: "Long-fermented sourdough with a crispy crust and open crumb. Baked fresh daily.", price: "$6.50" },
  { id: 106, name: "Baby Spinach",         description: "Tender young spinach leaves, washed and ready to eat. High in iron.", price: "$3.29" },
  { id: 107, name: "Blueberries",          description: "Plump, sweet blueberries packed with antioxidants. Freshly harvested.", price: "$4.79" },
  { id: 108, name: "Sweet Corn",           description: "Farm-fresh corn on the cob. Best eaten the same day for maximum sweetness.", price: "$1.99" },
];

const POULTRY_CUTS = [
  { id: 201, name: "Chicken Breast",       description: "Boneless, skinless chicken breast from pasture-raised birds. Lean and tender.", price: "$9.99" },
  { id: 202, name: "Whole Chicken",        description: "Air-chilled whole chicken, approximately 1.5 kg. Perfect for a Sunday roast.", price: "$14.99" },
  { id: 203, name: "Chicken Thighs",       description: "Skin-on, bone-in thighs from free-range birds. Juicy and full of flavour.", price: "$7.49" },
  { id: 204, name: "Duck Breast",          description: "Premium duck breast with a thick layer of fat for rich flavour.", price: "$12.99" },
  { id: 205, name: "Turkey Mince",         description: "Lean turkey mince, ideal for burgers, bolognese, and meatballs.", price: "$6.99" },
  { id: 206, name: "Chicken Wings",        description: "Meaty wings from free-range chickens. Great for grilling or baking.", price: "$5.99" },
  { id: 207, name: "Quail Eggs",           description: "A pack of 12 quail eggs. Delicately flavoured and perfect for salads.", price: "$4.29" },
  { id: 208, name: "Chicken Drumsticks",   description: "Plump drumsticks from pasture-raised birds. Family favourite.", price: "$6.49" },
  { id: 209, name: "Duck Legs",            description: "Slow-cook duck legs from heritage-breed birds raised on open pasture.", price: "$11.99" },
  { id: 210, name: "Chicken Liver",        description: "Fresh chicken livers, rich in vitamins and minerals. Great for pâté.", price: "$3.49" },
  { id: 211, name: "Turkey Breast",        description: "Boneless turkey breast, ideal for roasting or slicing thin for sandwiches.", price: "$13.49" },
  { id: 212, name: "Goose Fat",            description: "Rendered goose fat in a 400 g jar. Makes the crispiest roast potatoes.", price: "$7.99" },
  { id: 213, name: "Chicken Stock",        description: "Slow-simmered chicken stock from carcasses and vegetables. 1 litre.", price: "$4.99" },
  { id: 214, name: "Smoked Duck",          description: "Cold-smoked duck slices, ready to eat. Pairs beautifully with fig jam.", price: "$10.99" },
  { id: 215, name: "Chicken Sausages",     description: "Herbed chicken sausages with no artificial fillers. Gluten-free.", price: "$7.29" },
  { id: 216, name: "Pulled Turkey",        description: "Slow-cooked pulled turkey, seasoned with smoked paprika and garlic.", price: "$8.49" },
];

const OTHER_CATEGORY = [
  { id: 301, name: "Wild Salmon Fillet",   description: "Sustainably caught Atlantic salmon. Rich in omega-3 fatty acids.", price: "$16.99" },
  { id: 302, name: "Grass-Fed Beef Mince", description: "100% grass-fed beef mince, 500 g. Deep, beefy flavour and minimal fat.", price: "$11.49" },
  { id: 303, name: "Lamb Chops",           description: "Tender loin chops from pasture-raised lamb. Ready to grill in minutes.", price: "$15.99" },
  { id: 304, name: "Pork Belly",           description: "Thick-cut pork belly, skin on. Perfect slow-roasted until crispy.", price: "$10.49" },
  { id: 305, name: "Venison Steak",        description: "Wild venison loin steak. Lean, gamey, and deeply nutritious.", price: "$19.99" },
  { id: 306, name: "Swordfish Steak",      description: "Meaty swordfish steaks. Grill or pan-sear for a firm, mild flavour.", price: "$17.49" },
  { id: 307, name: "Pork Ribs",            description: "Full rack of pork spare ribs, ready to marinate and slow-cook.", price: "$13.99" },
  { id: 308, name: "Beef Sirloin",         description: "21-day dry-aged sirloin from grass-fed cattle. Restaurant quality.", price: "$22.99" },
  { id: 309, name: "Sea Bass Fillet",      description: "Line-caught sea bass fillets with skin on. Pan-fry in butter.", price: "$14.99" },
  { id: 310, name: "Lamb Shoulder",        description: "Whole lamb shoulder, bone in. Slow-roast for 6 hours until tender.", price: "$18.49" },
  { id: 311, name: "Tiger Prawns",         description: "Raw shell-on tiger prawns, 400 g. Sweet and succulent.", price: "$12.99" },
  { id: 312, name: "Beef Brisket",         description: "Flat-cut beef brisket from pasture-raised cattle. Ideal for smoking.", price: "$20.99" },
  { id: 313, name: "Pork Tenderloin",      description: "Lean pork tenderloin, trimmed and ready to cook. Quick and versatile.", price: "$9.99" },
  { id: 314, name: "Cod Fillet",           description: "MSC-certified cod fillets. Classic and versatile white fish.", price: "$13.49" },
  { id: 315, name: "Beef Short Ribs",      description: "Thick-cut beef short ribs from grass-fed cattle. Braise low and slow.", price: "$17.99" },
  { id: 316, name: "Mackerel Fillets",     description: "Freshly smoked mackerel fillets. Rich, oily, and packed with omega-3.", price: "$8.99" },
];

const TOTAL_PRODUCTS = BEST_SELLERS.length + POULTRY_CUTS.length + OTHER_CATEGORY.length;

interface PageProps {
  params: { id: string };
}

export default function StoreShopPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <StoreNavbar storeId={params.id} />
      <ShopHeroBanner />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <FilterProvider>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <FilterSidebar />

            {/* Product sections */}
            <div className="flex-1 min-w-0">
              <ActiveFiltersBar />
              <GridHeader resultCount={TOTAL_PRODUCTS} />
              <ProductCategorySection title="Best Sellers"   products={BEST_SELLERS} />
              <ProductCategorySection title="Poultry Cuts"   products={POULTRY_CUTS} />
              <ProductCategorySection title="Meat & Seafood" products={OTHER_CATEGORY} />
              <Pagination totalPages={6} />
            </div>
          </div>
        </FilterProvider>
      </main>

      <Footer />
    </div>
  );
}
