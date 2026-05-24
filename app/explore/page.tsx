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
import ProductGrid from "@/components/ProductGrid";

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}

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

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch products
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?status=eq.active&select=*&order=created_at.desc`,
        { headers }
      )
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        setProducts([])
        return
      }

      // Fetch all sellers separately
      const sellersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,fulfillment`,
        { headers }
      )
      const sellersData = await sellersRes.json()
      const sellersMap: any = {}
      if (Array.isArray(sellersData)) {
        sellersData.forEach((s: any) => { sellersMap[s.id] = s })
      }

      // Merge seller data into products
      const productsWithSellers = data.map((p: any) => ({
        ...p,
        sellers: sellersMap[p.seller_id] || null
      }))

      setProducts(productsWithSellers)

    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts([])
    } finally {
      setLoading(false)
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
