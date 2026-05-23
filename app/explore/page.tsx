"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/marketplace/HeroBanner";
import TopRated from "@/components/explore/TopRated";
import AdBanner from "@/components/explore/AdBanner";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";
import { useCart } from "@/lib/context/CartContext";
import { SUPABASE_URL, supabaseHeaders } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

interface Seller {
  id: string;
  farm_name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller_id: string;
  sellers: Seller | null;
}

export default function ExplorePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  function handleAddToCart(product: any) {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: `$${Number(product.price).toFixed(2)}`,
    });
  }

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?status=eq.active&select=id,name,price,unit,images,pricing_type,price_per_pound,stock_quantity,low_stock_threshold,seller_id&order=created_at.desc`,
        { headers: supabaseHeaders }
      );
      console.log('Products response status:', res.status);
      let products = await res.json();
      console.log('Products data:', products);
      console.log('Is array?', Array.isArray(products), '| Length:', Array.isArray(products) ? products.length : 'n/a');

      if (!Array.isArray(products)) {
        console.error('Products fetch returned non-array:', JSON.stringify(products));
        setProducts([]);
        return;
      }

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
      console.error('Explore fetch error:', err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />

        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar />
              <div className="flex-1 min-w-0">
                <ActiveFiltersBar />
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-sm text-red-500 mb-3">{error}</p>
                    <button
                      onClick={fetchData}
                      className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {products.length > 0 && <GridHeader resultCount={products.length} />}
                    <ProductGrid
                      products={products}
                      onAddToCart={handleAddToCart}
                      emptyMessage="No products found"
                      emptySubMessage="Try adjusting your filters or check back soon!"
                    />
                  </>
                )}
              </div>
            </div>
          </FilterProvider>
        </div>

        <TopRated />
        <AdBanner />
      </main>
      <Footer />
    </div>
  );
}
