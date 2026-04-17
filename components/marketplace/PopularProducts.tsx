import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

const PRODUCTS = [
  { name: "Organic Tomatoes",    description: "Sun-ripened organic tomatoes harvested fresh from local farms.",        price: "$3.99" },
  { name: "Free Range Eggs",     description: "A dozen farm-fresh eggs from pasture-raised, free-roaming hens.",      price: "$6.49" },
  { name: "Raw Wildflower Honey",description: "Pure unfiltered wildflower honey in a 16 oz glass jar.",               price: "$12.99" },
  { name: "Grass-Fed Ground Beef",description: "100% grass-fed and finished ground beef, 1 lb vacuum-sealed.",       price: "$9.99" },
  { name: "Baby Spinach",        description: "Crisp, tender baby spinach leaves grown without synthetic pesticides.", price: "$4.29" },
  { name: "Artisan Goat Cheese", description: "Creamy chèvre-style goat cheese made fresh at a nearby family dairy.", price: "$7.99" },
];

export default function PopularProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="Popular Products" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </section>
  );
}
