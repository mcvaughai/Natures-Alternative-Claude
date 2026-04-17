"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/lib/context/CartContext";

const SHIPPING = 8.0;
const TAX = 3.0;

// ── Image placeholder shared between item rows and saved cards ────────────────
function ImgPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 flex items-center justify-center text-gray-400 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

// ── Single cart item row ──────────────────────────────────────────────────────
function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart, saveForLater } = useCart();

  return (
    <div className="flex gap-4 py-5">
      {/* Image */}
      <ImgPlaceholder className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1 — name + actions */}
        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
          <button
            onClick={() => saveForLater(item.id)}
            className="shrink-0 text-xs bg-gray-900 hover:bg-gray-700 text-white px-3 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            Save for later?
          </button>
          <button
            onClick={() => removeFromCart(item.id)}
            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
            aria-label="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Row 2 — description */}
        <p className="text-xs text-gray-500 mt-1 mb-3 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Row 3 — price + quantity */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-800">
            ${(item.priceEach * item.quantity).toFixed(2)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-full bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white flex items-center justify-center font-bold text-base leading-none transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-7 text-center font-semibold text-sm text-gray-900 tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 rounded-full bg-gray-900 hover:bg-gray-700 text-white flex items-center justify-center font-bold text-base leading-none transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Order summary + saved-for-later ──────────────────────────────────────────
function OrderSummary() {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const { subtotal, savedItems, moveToCart } = useCart();
  const router = useRouter();

  const total = subtotal + SHIPPING + TAX;

  // Always show 3 slots; fill with saved items then nulls
  const slots: (CartItem | null)[] = [
    ...savedItems.slice(0, 3),
    ...Array<null>(Math.max(0, 3 - savedItems.length)).fill(null),
  ];

  return (
    <div className="space-y-6">
      {/* ── Summary card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-5">Summary</h3>

        {/* Promo code dropdown */}
        <button
          onClick={() => setPromoOpen(!promoOpen)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3"
        >
          <span>Do you have a promo code?</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {promoOpen && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Apply
            </button>
          </div>
        )}

        <hr className="border-gray-100 mb-5" />

        {/* Line items */}
        <div className="space-y-3 text-sm mb-5">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated shipping &amp; handling</span>
            <span className="font-medium tabular-nums">${SHIPPING.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated tax</span>
            <span className="font-medium tabular-nums">${TAX.toFixed(2)}</span>
          </div>
        </div>

        <hr className="border-gray-100 mb-5" />

        <div className="flex justify-between font-bold text-gray-900 text-base mb-6">
          <span>Total</span>
          <span className="tabular-nums">${total.toFixed(2)}</span>
        </div>

        <button
          onClick={() => router.push("/checkout")}
          className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors"
        >
          Checkout
        </button>
      </div>

      {/* ── Saved for later ── */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Saved for later</h4>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((item, i) =>
            item ? (
              <button
                key={item.id}
                onClick={() => moveToCart(item.id)}
                title={`Move "${item.name}" back to cart`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 hover:bg-gray-300 transition-colors text-gray-400"
              >
                <ImgPlaceholder className="w-full h-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-end">
                  <span className="w-full text-center text-[10px] text-white bg-black/50 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Move to cart
                  </span>
                </div>
              </button>
            ) : (
              <ImgPlaceholder key={`empty-${i}`} className="aspect-square rounded-xl" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CartSection() {
  const { cartItems, totalItems, subtotal } = useCart();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* ── LEFT: Cart items ── */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Cart ({totalItems})
            </h2>
            <span className="text-sm font-semibold text-gray-700 tabular-nums">
              Total: ${subtotal.toFixed(2)}
            </span>
          </div>
          <hr className="border-gray-200 mb-1" />

          {/* Item list */}
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-sm py-12 text-center">Your cart is empty.</p>
          ) : (
            cartItems.map((item, idx) => (
              <div key={item.id}>
                <CartItemRow item={item} />
                {idx < cartItems.length - 1 && (
                  <hr className="border-gray-100" />
                )}
              </div>
            ))
          )}
        </div>

        {/* ── RIGHT: Summary + saved ── */}
        <div className="lg:sticky lg:top-[120px]">
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}
