"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";

const MORE_FROM_SELLER = [
  { id: 301, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip.", price: "$4.99" },
  { id: 302, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip.", price: "$6.49" },
  { id: 303, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip.", price: "$3.99" },
  { id: 304, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip.", price: "$8.99" },
];

const IMAGE_PLACEHOLDER = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const router = useRouter();

  function handleAddToCart() {
    // Placeholder: wire to cart context/state when ready
    console.log(`Cart: added ${qty}× product #${productId}`);
  }

  function handleDecrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function handleIncrement() {
    setQty((q) => q + 1);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 lg:gap-8">

        {/* ── LEFT: Images ──────────────────────────────────────── */}
        <div>
          {/* Main image */}
          <div className="bg-gray-200 aspect-square rounded-2xl flex items-center justify-center text-gray-400 mb-3">
            {IMAGE_PLACEHOLDER}
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-gray-200 aspect-square rounded-xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* ── MIDDLE: Details ───────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Pancakes</h1>

          <div className="mb-5">
            <span className="font-semibold text-gray-700 text-sm">Description:</span>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>

          <p className="text-3xl font-bold text-[#1a4a2e] mb-6">$23.75</p>

          {/* Quantity selector */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
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
                onClick={handleIncrement}
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
            className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] active:bg-[#561010] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm mb-6 text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart
          </button>

          {/* Store info card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h4 className="font-bold text-gray-900 text-base mb-1">Natures Alternative</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
              ut labore et dolore magna aliqua, ut enim veniam.
            </p>
            <button
              onClick={() => router.push("/store/natures-alternative")}
              className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Visit Store
            </button>
          </div>
        </div>

        {/* ── RIGHT: More from this seller ──────────────────────── */}
        <div>
          <h3 className="text-right text-sm font-semibold text-gray-700 mb-4">More from this seller</h3>
          <div className="grid grid-cols-2 gap-3">
            {MORE_FROM_SELLER.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                price={p.price}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
