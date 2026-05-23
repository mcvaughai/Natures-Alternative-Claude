"use client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";
import { SUPABASE_URL, supabaseHeaders } from "@/lib/api";

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
    async function fetchProducts() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/products?status=eq.active&featured=eq.true&select=id,name,price,unit,images,pricing_type,price_per_pound,stock_quantity,low_stock_threshold,seller_id&limit=6`,
          { headers: supabaseHeaders }
        );
        let products = await res.json();
        if (!Array.isArray(products) || products.length === 0) return;

        const sellerIds = [...new Set(products.map((p: any) => p.seller_id).filter(Boolean))];
        if (sellerIds.length > 0) {
          const sellersRes = await fetch(
            `${SUPABASE_URL}/rest/v1/sellers?id=in.(${sellerIds.join(',')})&select=id,farm_name,store_name,slug,fulfillment`,
            { headers: supabaseHeaders }
          );
          const sellersData = await sellersRes.json();
          if (Array.isArray(sellersData)) {
            const sellersMap = sellersData.reduce((acc: any, s: any) => { acc[s.id] = s; return acc; }, {});
            products = products.map((p: any) => ({ ...p, sellers: sellersMap[p.seller_id] || null }));
          }
        }
        setProducts(products);
      } catch (err) {
        console.error("PopularProducts fetch error:", err);
      }
    }
    fetchProducts();
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
