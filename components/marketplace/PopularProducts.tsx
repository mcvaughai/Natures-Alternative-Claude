"use client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";
import { fetchFromSupabase } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFromSupabase<Product[]>(
      "products?status=eq.active&featured=eq.true&select=id,name,description,price,images&limit=6"
    )
      .then((data) => { if (data?.length) setProducts(data); })
      .catch((err) => console.error("PopularProducts fetch error:", err));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="w-full px-6 py-4">
      <SectionHeader title="Popular Products" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
