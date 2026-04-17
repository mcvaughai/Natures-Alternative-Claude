import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

const TOP_RATED = [
  { id: 101, name: "Heritage Pork Chops",  description: "Bone-in chops from heritage-breed hogs raised on open pasture.",        price: "$11.99" },
  { id: 102, name: "Wild Salmon Fillet",   description: "Wild-caught Pacific salmon, skin-on fillet, sustainably harvested.",     price: "$14.99" },
  { id: 103, name: "Aged Farm Cheddar",    description: "Sharp 12-month aged cheddar from a single-herd grass-fed dairy farm.",   price: "$9.49"  },
  { id: 104, name: "Artisan Sourdough",    description: "Long-fermented sourdough baked in a stone oven with local wheat flour.",  price: "$8.49"  },
];

export default function TopRated() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="Top Rated" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {TOP_RATED.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} />
        ))}
      </div>
    </section>
  );
}
