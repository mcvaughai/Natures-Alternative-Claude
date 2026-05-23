"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock_qty: number;
  unit: string;
  images: string[];
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [products, setProducts]       = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (slug) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function fetchData() {
    setLoading(true);
    setError("");

    try {
      console.log("Fetching category:", slug);

      // Step 1: fetch category by slug
      const categoryResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?slug=eq.${slug}&select=id,name,slug`,
        { headers: HEADERS }
      );

      console.log("Category response status:", categoryResponse.status);
      const categories = await categoryResponse.json();
      console.log("Categories:", categories);

      if (!categories || categories.length === 0) {
        setError("Category not found");
        return;
      }

      const category = categories[0];
      setCategoryName(category.name);

      // Step 2: fetch products — correct columns: status (not is_active), stock_qty (not stock_quantity)
      const productsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/products?category_id=eq.${category.id}&status=eq.active&select=id,name,price,description,stock_qty,unit,images,pricing_type,price_per_pound`,
        { headers: HEADERS }
      );

      console.log("Products response status:", productsResponse.status);
      const productsData = await productsResponse.json();
      console.log("Products:", productsData);

      setProducts(productsData || []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error("Error:", err);
      setError("Failed to load: " + (e?.message ?? "unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main>
        <div className="bg-green-900 text-white py-10 text-center">
          <h1 className="text-4xl font-bold">{categoryName || slug}</h1>
          <p className="mt-2 text-green-100">Fresh from local natural farms near you</p>
        </div>

        <div className="p-6 bg-[#FCF7F4] min-h-screen">
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto" />
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-red-600">Error</h3>
              <p className="text-gray-500 mt-2">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 bg-green-900 text-white px-6 py-2 rounded-full"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-green-900">
                No products in this category yet
              </h3>
              <p className="text-gray-500 mt-2">
                Check back soon as more farms join!
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-block bg-green-900 text-white px-6 py-2 rounded-full"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div>
              <p className="text-gray-500 mb-6">
                Showing {products.length} products in {categoryName}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 bg-gray-200">
                      {product.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm">{product.name}</h4>
                      <p className="text-green-900 font-bold mt-1">
                        ${product.price}/{product.unit || "each"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
