"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";
import { fetchFromSupabase } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function fetchResults() {
    setLoading(true);
    setError("");
    try {
      const endpoint = query
        ? `products?name=ilike.*${encodeURIComponent(query)}*&status=eq.active&select=id,name,description,price,unit,images,pricing_type,price_per_pound&order=created_at.desc`
        : "products?status=eq.active&select=id,name,description,price,unit,images,pricing_type,price_per_pound&order=created_at.desc";

      const data = await fetchFromSupabase<Product[]>(endpoint);
      setProducts(data ?? []);
    } catch (err) {
      console.error("Search fetch error:", err);
      setError("Failed to load results.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-5">
        <div className="w-full px-6">
          {query ? (
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Search Results for: <span className="text-[#1a4a2e]">&quot;{query}&quot;</span>
            </h1>
          ) : (
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Products</h1>
          )}
        </div>
      </div>

      {/* Two-column layout */}
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
                    onClick={fetchResults}
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
                    emptyMessage={query ? `No products found for "${query}"` : "No products available yet"}
                    emptySubMessage={query ? "Try a different search." : "Check back soon!"}
                  />
                </>
              )}
            </div>
          </div>
        </FilterProvider>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
          </div>
        }>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
