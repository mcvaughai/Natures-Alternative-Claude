"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id?: string | number;
  name?: string;
  description?: string;
  price?: string;
}

export default function ProductCard({
  id = 1,
  name = "Product",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  price = "$4.99",
}: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => router.push(`/product/${id}`)}
    >
      {/* Image placeholder */}
      <div className="relative bg-gray-200 aspect-square">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Wishlist button — stopPropagation so card click doesn't fire */}
        <button
          onClick={(e) => { e.stopPropagation(); setWished(!wished); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm z-10"
          aria-label="Add to wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-colors ${wished ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-400"}`}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate group-hover:text-[#1a4a2e] transition-colors">{name}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1a4a2e] text-sm">{price}</span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white rounded-full p-1.5 transition-colors"
            aria-label="Add to cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
