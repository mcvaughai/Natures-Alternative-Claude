import ProductCard from "@/components/shared/ProductCard";

const PRODUCTS = [
  { id: 501, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex.", price: "$8.99" },
  { id: 502, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex.", price: "$12.49" },
  { id: 503, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex.", price: "$5.99" },
  { id: 504, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip ex.", price: "$9.75" },
];

export default function Bestsellers() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-8 uppercase tracking-wider">
        Shop Our Bestsellers
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} />
        ))}
      </div>
    </section>
  );
}
