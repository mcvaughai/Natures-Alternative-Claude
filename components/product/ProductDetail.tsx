"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";
import { useCart } from "@/lib/context/CartContext";
import { supabase } from "@/lib/supabase";

interface Seller {
  slug: string;
  farm_name: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller_id: string;
  sellers: Seller | Seller[];
}

interface RelatedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

const IMAGE_PLACEHOLDER = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [qty, setQty]                   = useState(1);
  const [added, setAdded]               = useState(false);
  const [product, setProduct]           = useState<Product | null>(null);
  const [moreProducts, setMoreProducts] = useState<RelatedProduct[]>([]);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, images, seller_id, sellers(slug, farm_name, description)")
        .eq("id", productId)
        .single();

      if (!data) return;
      setProduct(data as unknown as Product);

      const { data: more } = await supabase
        .from("products")
        .select("id, name, description, price, images")
        .eq("seller_id", data.seller_id)
        .eq("status", "active")
        .neq("id", productId)
        .limit(4);

      if (more) setMoreProducts(more);
    }
    load();
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    addToCart({
      id:          product.id,
      name:        product.name,
      description: product.description,
      price:       `$${product.price.toFixed(2)}`,
      quantity:    qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  // Supabase returns foreign-key joins as arrays; normalise to a single object
  const seller: Seller | undefined = product
    ? (Array.isArray(product.sellers) ? product.sellers[0] : product.sellers)
    : undefined;

  const mainImage = product?.images?.[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 lg:gap-8">

        {/* ── LEFT: Images ──────────────────────────────────────── */}
        <div>
          {/* Main image */}
          <div className="bg-gray-200 aspect-square rounded-2xl flex items-center justify-center text-gray-400 mb-3 overflow-hidden">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product?.name} className="w-full h-full object-cover" />
            ) : IMAGE_PLACEHOLDER}
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => {
              const img = product?.images?.[i + 1];
              return (
                <div
                  key={i}
                  className="bg-gray-200 aspect-square rounded-xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MIDDLE: Details ───────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {product?.name ?? "Loading..."}
          </h1>

          <div className="mb-5">
            <span className="font-semibold text-gray-700 text-sm">Description:</span>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {product?.description ?? ""}
            </p>
          </div>

          <p className="text-3xl font-bold text-[#1a4a2e] mb-6">
            {product ? `$${product.price.toFixed(2)}` : ""}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg leading-none transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-8 text-center border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a4a2e] focus:border-transparent"
                min={1}
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg leading-none transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product}
            className={`w-full ${added ? "bg-[#1a4a2e] hover:bg-[#2d6b47]" : "bg-[#8b1a1a] hover:bg-[#6d1414] active:bg-[#561010]"} text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm mb-6 text-base disabled:opacity-50`}
          >
            {added ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          {/* Store info card */}
          {seller && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h4 className="font-bold text-gray-900 text-base mb-1">{seller.farm_name}</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {seller.description ?? ""}
              </p>
              <button
                onClick={() => router.push(`/store/${seller.slug}`)}
                className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Visit Store
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: More from this seller ──────────────────────── */}
        <div>
          <h3 className="text-right text-sm font-semibold text-gray-700 mb-4">More from this seller</h3>
          <div className="grid grid-cols-2 gap-3">
            {moreProducts.map((p) => (
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
        </div>
      </div>
    </section>
  );
}
