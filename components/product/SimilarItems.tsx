import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

const SIMILAR_ITEMS = [
  { id: 401, name: "French Toast Mix",  description: "Classic French toast batter mix made with cage-free eggs and real vanilla.", price: "$6.99" },
  { id: 402, name: "Waffle Batter",     description: "Light and crispy waffle batter, just add water — ready in minutes.",        price: "$7.49" },
  { id: 403, name: "Crepe Mix",         description: "Delicate French-style crepe mix milled from stone-ground heritage wheat.",   price: "$5.99" },
  { id: 404, name: "Granola Blend",     description: "Slow-baked granola with oats, honey, and mixed seeds from local farms.",     price: "$8.49" },
];

export default function SimilarItems() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SectionHeader title="Similar Items" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SIMILAR_ITEMS.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} />
        ))}
      </div>
    </section>
  );
}
