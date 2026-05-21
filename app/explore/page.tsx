"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/marketplace/HeroBanner";
import TopRated from "@/components/explore/TopRated";
import AdBanner from "@/components/explore/AdBanner";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";
import { useCart } from "@/lib/context/CartContext";
import { fetchFromSupabase } from "@/lib/api";

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

function ExploreProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const seller = product.sellers;

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: `$${product.price.toFixed(2)}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <div className="relative bg-gray-200 aspect-square overflow-hidden">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate group-hover:text-[#1a4a2e] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-1 line-clamp-2 leading-relaxed">{product.description}</p>

        {seller?.farm_name && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 truncate">{seller.farm_name}</span>
            {seller.slug && (
              <Link
                href={`/store/${seller.slug}`}
                onClick={e => e.stopPropagation()}
                className="text-xs text-[#1a4a2e] hover:underline font-medium shrink-0 ml-1"
              >
                Visit Store
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1a4a2e] text-sm">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className={`rounded-full p-1.5 transition-colors ${added ? "bg-[#1a4a2e] hover:bg-[#2d6b47]" : "bg-[#8b1a1a] hover:bg-[#6d1414]"} text-white`}
            aria-label="Add to cart"
          >
            {added ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
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
        "products?status=eq.active&select=id,name,description,price,images,seller_id,sellers(id,farm_name,slug)&order=created_at.desc"
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
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
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
                        <ExploreProductCard key={p.id} product={p} />
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
