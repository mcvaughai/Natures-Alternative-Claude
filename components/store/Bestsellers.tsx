import ProductCard from "@/components/shared/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

interface BestsellersProps {
  products?: Product[];
}

export default function Bestsellers({ products = [] }: BestsellersProps) {
  if (products.length === 0) return null;

  return (
    <section className="w-full px-6 py-10">
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-8 uppercase tracking-wider">
        Shop Our Bestsellers
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            price={`$${p.price.toFixed(2)}`}
            imageUrl={p.images?.[0]}
          />
        ))}
      </div>
    </section>
  );
}
