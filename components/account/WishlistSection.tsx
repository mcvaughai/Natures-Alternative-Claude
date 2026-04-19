"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WishlistItem {
  id: number;
  name: string;
  description: string;
  price: string;
}

const INITIAL_ITEMS: WishlistItem[] = [
  { id: 30, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$4.99" },
  { id: 31, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$7.50" },
  { id: 32, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$3.25" },
  { id: 33, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$9.99" },
  { id: 34, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$5.50" },
  { id: 35, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$12.00" },
  { id: 36, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$6.75" },
  { id: 37, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$8.25" },
];

function WishlistCard({ item, onRemove }: { item: WishlistItem; onRemove: (id: number) => void }) {
  const router = useRouter();
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => router.push(`/product/${item.id}`)}
    >
      {/* Image */}
      <div className="relative bg-gray-200 aspect-square flex items-center justify-center text-gray-400 overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {/* Filled red heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm z-10"
          aria-label="Remove from wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-red-500 stroke-red-500"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate group-hover:text-[#1a4a2e] transition-colors">{item.name}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#1a4a2e] text-sm">{item.price}</span>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function WishlistSection() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-sm text-gray-500 mt-1">{items.length} saved items</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-sm text-gray-500">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
