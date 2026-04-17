import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

const DISCOUNTED = [
  { id: 601, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex commodo.", price: "$3.49" },
  { id: 602, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex commodo.", price: "$5.99" },
  { id: 603, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex commodo.", price: "$2.79" },
  { id: 604, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex commodo.", price: "$7.49" },
];

export default function DiscountedItems() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SectionHeader title="Discounted Items" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DISCOUNTED.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} />
        ))}
      </div>
    </section>
  );
}
