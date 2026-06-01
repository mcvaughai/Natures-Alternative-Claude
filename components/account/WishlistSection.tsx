"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const getHeaders = (token: string) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

function WishlistCard({
  item,
  onRemove,
  onAddToCart,
}: {
  item: any;
  onRemove: (wishlistId: string) => void;
  onAddToCart: (item: any) => void;
}) {
  const priceDisplay =
    item.pricing_type === "per_pound"
      ? `$${Number(item.price_per_pound ?? 0).toFixed(2)}/lb`
      : `$${Number(item.price ?? 0).toFixed(2)}${item.unit ? `/${item.unit}` : ""}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <Link href={`/product/${item.id}`}>
        <div className="relative bg-gray-100 aspect-square overflow-hidden">
          {item.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Remove button */}
          <button
            onClick={(e) => { e.preventDefault(); onRemove(item.wishlist_id); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm z-10"
            aria-label="Remove from wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-red-500 stroke-red-500" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link href={`/product/${item.id}`}>
          <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate group-hover:text-[#1a4a2e] transition-colors">
            {item.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#1a4a2e] text-sm">{priceDisplay}</span>
        </div>
        <button
          onClick={() => onAddToCart(item)}
          className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function WishlistSection() {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (!sessionStr) { setLoading(false); return; }
    const sess = JSON.parse(sessionStr);
    setSession(sess);
    fetchWishlist(sess);
  }, []);

  async function fetchWishlist(sess: any) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/wishlist_items?user_id=eq.${sess.user_id}&select=*,products(id,name,price,unit,images,pricing_type,price_per_pound,seller_id)&order=created_at.desc`,
        { headers: getHeaders(sess.access_token) }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        const wishlistItems = data
          .map((item: any) => ({
            wishlist_id: item.id,
            ...item.products,
          }))
          .filter((item: any) => item.id);
        setItems(wishlistItems);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(wishlistId: string) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/wishlist_items?id=eq.${wishlistId}`,
        { method: "DELETE", headers: getHeaders(session.access_token) }
      );
      setItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  }

  function handleAddToCart(item: any) {
    addToCart({
      id:          item.id,
      name:        item.name,
      description: "",
      price:
        item.pricing_type === "per_pound"
          ? `$${Number(item.price_per_pound ?? 0).toFixed(2)}`
          : `$${Number(item.price ?? 0).toFixed(2)}`,
      image:       item.images?.[0],
      seller_id:   item.seller_id,
      unit:        item.unit,
      quantity:    1,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
        {!loading && <p className="text-sm text-gray-500 mt-1">{items.length} saved items</p>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
        </div>
      ) : !session ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-sm">Please <Link href="/login" className="text-[#1a4a2e] font-semibold underline">log in</Link> to view your wishlist.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">♡</div>
          <h3 className="font-raleway font-bold text-gray-700 text-xl mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 mb-6">Save products you love and come back to them later</p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: "#053D2D" }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <WishlistCard
              key={item.wishlist_id}
              item={item}
              onRemove={removeItem}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
