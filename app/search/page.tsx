"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";
import { supabase } from "@/lib/supabase";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const req = supabase
      .from("products")
      .select("id, name, description, price, images")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    const finalReq = query ? req.ilike("name", `%${query}%`) : req;
    finalReq.then(({ data }) => {
      if (data) setProducts(data);
      setLoading(false);
    });
  }, [query]);

  return (
    <>
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
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
