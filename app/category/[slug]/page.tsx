"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import StoreCard from "@/components/shared/StoreCard";
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from "@/components/FilterSidebar";
import GridHeader from "@/components/explore/GridHeader";
import { supabase } from "@/lib/supabase";

interface CategoryPageProps {
  params: { slug: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller_id: string;
}

interface SellerCard {
  id: string;
  name: string;
  tagline: string;
}

function getCategoryName(slug: string): string {
  const names: Record<string, string> = {
    "meat-poultry":      "Meat & Poultry",
    "fruits-vegetables": "Fruits & Vegetables",
    "dairy-eggs":        "Dairy & Eggs",
    "seafood":           "Seafood",
    "bakery-breads":     "Bakery & Breads",
    "honey-preserves":   "Honey & Preserves",
    "herbs-botanicals":  "Herbs & Botanicals",
  };
  return names[slug] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const categoryName = getCategoryName(slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers]   = useState<SellerCard[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      // Resolve category id from slug
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!category) {
        setLoading(false);
        return;
      }

      // Fetch active products in this category
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, description, price, images, seller_id")
        .eq("category_id", category.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (productsData) {
        setProducts(productsData);

        // Build seller list from unique seller IDs
        const sellerIds = Array.from(new Set(productsData.map((p) => p.seller_id)));
        if (sellerIds.length > 0) {
          const { data: sellersData } = await supabase
            .from("sellers")
            .select("slug, farm_name, description")
            .in("id", sellerIds)
            .eq("status", "approved");

          if (sellersData) {
            setSellers(
              sellersData.map((s) => ({
                id:      s.slug,
                name:    s.farm_name,
                tagline: s.description ?? "",
              }))
            );
          }
        }
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Category Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{categoryName}</h1>
            <p className="text-[#f5f0e8] opacity-90">Fresh from local natural farms near you</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category={slug} />
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
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          price={`$${product.price.toFixed(2)}`}
                          description={product.description}
                          imageUrl={product.images?.[0]}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </FilterProvider>
        </div>

        {/* Farms in This Category */}
        {sellers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Farms Selling {categoryName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sellers.map((farm) => (
                <StoreCard key={farm.id} id={farm.id} name={farm.name} tagline={farm.tagline} />
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
