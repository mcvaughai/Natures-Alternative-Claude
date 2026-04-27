"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/marketplace/HeroBanner";
import ProductCard from "@/components/shared/ProductCard";
import TopRated from "@/components/explore/TopRated";
import AdBanner from "@/components/explore/AdBanner";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";
import { fetchFromSupabase } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

export default function ExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFromSupabase<Product[]>(
        "products?status=eq.active&select=id,name,description,price,images&order=created_at.desc"
      );
      setProducts(data ?? []);
    } catch (err) {
      console.error("Explore fetch error:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                ) : products.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 text-sm">
                    No products available yet. Check back soon!
                  </div>
                ) : (
                  <>
                    <GridHeader resultCount={products.length} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <ProductCard
                          key={p.id}
                          id={p.id}
                          name={p.name}
                          price={`$${p.price.toFixed(2)}`}
                          description={p.description}
                          imageUrl={p.images?.[0]}
                        />
                      ))}
                    </div>
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
