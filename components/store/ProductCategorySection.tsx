import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

interface ProductCategorySectionProps {
  title: string;
  products: Product[];
}

export default function ProductCategorySection({ title, products }: ProductCategorySectionProps) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            price={p.price}
            imageUrl={p.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
