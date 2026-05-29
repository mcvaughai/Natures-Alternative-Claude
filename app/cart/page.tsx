'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/lib/context/CartContext'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, addToCart } = useCart()
  const [sellers, setSellers]                   = useState<{[key: string]: any}>({})
  const [fulfillmentChoices, setFulfillmentChoices] = useState<{[key: string]: string}>({})
  const [loading, setLoading]                   = useState(true)
  const [upsellProducts, setUpsellProducts]     = useState<any[]>([])
  const [upsellAdded, setUpsellAdded]           = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchSellerData()
    } else {
      setLoading(false)
    }
  }, [cartItems])

  const fetchSellerData = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,fulfillment,pickup_hours,pickup_address,logo_url`,
        { headers }
      )
      const data = await res.json()
      if (Array.isArray(data)) {
        const sellersMap: {[key: string]: any} = {}
        data.forEach((s: any) => { sellersMap[s.id] = s })
        setSellers(sellersMap)
        // Fetch upsell suggestions now that we have seller data
        await fetchUpsellProducts(sellersMap)
      }
    } catch (err) {
      console.error('Error fetching sellers:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpsellProducts = async (sellersMap: {[key: string]: any}) => {
    try {
      // Collect seller_ids from cart to prefer same-farm products
      const cartSellerIds = [...new Set(cartItems.map((i: any) => i.seller_id).filter(Boolean))]
      const cartItemIds   = cartItems.map((i: any) => String(i.id))

      let products: any[] = []

      // 1. Try products from the same sellers first (up to 8)
      if (cartSellerIds.length > 0) {
        const sellerFilter = cartSellerIds.map(id => `seller_id.eq.${id}`).join(',')
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=id,name,price,unit,images,seller_id,pricing_type,price_per_pound&status=eq.active&or=(${sellerFilter})&limit=12&order=created_at.desc`,
          { headers }
        )
        const data = await res.json()
        if (Array.isArray(data)) {
          products = data.filter((p: any) => !cartItemIds.includes(String(p.id)))
        }
      }

      // 2. If fewer than 4 results, pad with newest active products
      if (products.length < 4) {
        const existing = new Set(products.map((p: any) => String(p.id)))
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=id,name,price,unit,images,seller_id,pricing_type,price_per_pound&status=eq.active&limit=16&order=created_at.desc`,
          { headers }
        )
        const data = await res.json()
        if (Array.isArray(data)) {
          const extras = data.filter(
            (p: any) => !cartItemIds.includes(String(p.id)) && !existing.has(String(p.id))
          )
          products = [...products, ...extras]
        }
      }

      // Merge seller data and cap at 8
      const merged = products.slice(0, 8).map((p: any) => ({
        ...p,
        seller: sellersMap[p.seller_id] || null,
      }))
      setUpsellProducts(merged)
    } catch (err) {
      console.error('Error fetching upsell products:', err)
    }
  }

  const handleUpsellAdd = (product: any) => {
    addToCart({
      id:          product.id,
      name:        product.name,
      description: '',
      price:       `$${Number(product.price).toFixed(2)}`,
      image:       product.images?.[0],
      seller_id:   product.seller_id,
      unit:        product.unit,
    })
    setUpsellAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setUpsellAdded(prev => ({ ...prev, [product.id]: false })), 1500)
  }

  // Group cart items by seller
  const itemsBySeller = cartItems.reduce((acc: {[key: string]: any[]}, item: any) => {
    const sellerId = item.seller_id || 'unknown'
    if (!acc[sellerId]) acc[sellerId] = []
    acc[sellerId].push(item)
    return acc
  }, {})

  // Calculate subtotal per seller (uses priceEach from CartContext)
  const getSellerSubtotal = (items: any[]) =>
    items.reduce((sum: number, item: any) => sum + (item.priceEach * (item.quantity || 1)), 0)

  // Calculate overall total
  const total = cartItems.reduce((sum: number, item: any) =>
    sum + (item.priceEach * (item.quantity || 1)), 0
  )

  const handleFulfillmentChange = (sellerId: string, method: string) => {
    setFulfillmentChoices(prev => ({ ...prev, [sellerId]: method }))
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-900" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="w-full px-6 py-8">
        <h1 className="font-raleway text-3xl font-bold text-gray-900 mb-2">
          Your Cart
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          {cartItems.length === 0
            ? 'Your cart is empty'
            : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} from ${Object.keys(itemsBySeller).length} farm${Object.keys(itemsBySeller).length > 1 ? 's' : ''}`
          }
        </p>

        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="font-raleway text-2xl font-bold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added anything yet
            </p>
            <Link
              href="/explore"
              className="inline-block px-8 py-3 rounded-full text-white font-semibold"
              style={{ backgroundColor: '#053D2D' }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex gap-8 items-start">

            {/* ── LEFT — Cart items grouped by seller ── */}
            <div className="flex-1 space-y-6">
              {Object.entries(itemsBySeller).map(([sellerId, items]: [string, any[]]) => {
                const seller = sellers[sellerId]
                const fulfillmentOptions: string[] = Array.isArray(seller?.fulfillment) ? seller.fulfillment : []
                const selectedFulfillment = fulfillmentChoices[sellerId]
                const sellerSubtotal = getSellerSubtotal(items)

                return (
                  <div
                    key={sellerId}
                    className="border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Seller header */}
                    <div
                      className="px-5 py-4 flex items-center justify-between"
                      style={{ backgroundColor: '#f8faf8' }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Seller logo or initial fallback */}
                        {seller?.logo_url ? (
                          <img
                            src={seller.logo_url}
                            alt={seller.farm_name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: '#053D2D' }}
                          >
                            {(seller?.farm_name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link
                            href={seller?.slug ? `/store/${seller.slug}` : '#'}
                            className="font-raleway font-bold text-gray-900 hover:text-green-900 transition-colors"
                          >
                            {seller?.farm_name || 'Unknown Farm'}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {items.length} item{items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">
                        ${sellerSubtotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Fulfillment selector */}
                    {fulfillmentOptions.length > 0 && (
                      <div className="px-5 py-3 border-b border-gray-100 bg-white">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Choose Fulfillment:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {fulfillmentOptions.map((method: string) => {
                            const icon = method === 'Farm Pickup' ? '🚗'
                              : method === 'Local Delivery' ? '🚚'
                              : '📦'
                            return (
                              <button
                                key={method}
                                onClick={() => handleFulfillmentChange(sellerId, method)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors"
                                style={{
                                  borderColor: selectedFulfillment === method ? '#053D2D' : '#e5e7eb',
                                  backgroundColor: selectedFulfillment === method ? '#f0fdf4' : 'white',
                                  color: selectedFulfillment === method ? '#053D2D' : '#6b7280',
                                }}
                              >
                                {icon} {method}
                              </button>
                            )
                          })}
                        </div>
                        {!selectedFulfillment && (
                          <p className="text-xs text-amber-600 mt-2">
                            ⚠️ Please select a fulfillment option
                          </p>
                        )}
                        {selectedFulfillment === 'Farm Pickup' && seller?.pickup_hours && (
                          <p className="text-xs text-gray-500 mt-2">
                            🕐 Pickup hours: {seller.pickup_hours}
                          </p>
                        )}
                        {selectedFulfillment === 'Farm Pickup' && seller?.pickup_address && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {seller.pickup_address}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    <div className="divide-y divide-gray-100">
                      {items.map((item: any) => (
                        <div key={item.id} className="px-5 py-4 flex gap-4 bg-white">

                          {/* Product image */}
                          <div
                            className="flex-shrink-0 overflow-hidden rounded-xl bg-gray-100"
                            style={{ width: '90px', height: '90px' }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center px-1">No image</span>
                              </div>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="flex-1">
                            <Link
                              href={`/product/${item.id}`}
                              className="font-semibold text-gray-900 hover:text-green-900 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-500 mt-0.5">
                              ${item.priceEach.toFixed(2)} per {item.unit || 'each'}
                            </p>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1">
                                <button
                                  onClick={() => {
                                    if ((item.quantity || 1) <= 1) {
                                      removeFromCart(item.id)
                                    } else {
                                      updateQuantity(item.id, (item.quantity || 1) - 1)
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-medium">
                                  {item.quantity || 1}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-sm text-red-500 hover:text-red-700 transition-colors"
                              >
                                Remove
                              </button>

                              <Link
                                href="/account/wishlist"
                                className="text-sm hover:underline transition-colors"
                                style={{ color: '#00674B' }}
                                onClick={() => removeFromCart(item.id)}
                              >
                                ♡ Save to Wishlist
                              </Link>
                            </div>
                          </div>

                          {/* Item total */}
                          <div className="flex-shrink-0 text-right">
                            <p className="font-bold text-gray-900">
                              ${(item.priceEach * (item.quantity || 1)).toFixed(2)}
                            </p>
                            {(item.quantity || 1) > 1 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                ${item.priceEach.toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Clear cart */}
              <button
                onClick={() => {
                  if (confirm('Clear all items from your cart?')) clearCart()
                }}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Clear entire cart
              </button>
            </div>

            {/* ── RIGHT — Order summary ── */}
            <div className="flex-shrink-0 sticky top-40" style={{ width: '320px' }}>
              <div className="border border-gray-200 rounded-2xl p-5">
                <h2 className="font-raleway text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Per-seller breakdown */}
                <div className="space-y-2 mb-4">
                  {Object.entries(itemsBySeller).map(([sellerId, items]: [string, any[]]) => {
                    const seller = sellers[sellerId]
                    return (
                      <div key={sellerId} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {seller?.farm_name || 'Unknown Farm'}
                        </span>
                        <span className="font-medium">
                          ${getSellerSubtotal(items).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Delivery fees</span>
                    <span className="text-gray-400">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 mb-5">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl" style={{ color: '#053D2D' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Fulfillment warning */}
                {Object.keys(itemsBySeller).some(sellerId => {
                  const seller = sellers[sellerId]
                  return Array.isArray(seller?.fulfillment) && seller.fulfillment.length > 0 && !fulfillmentChoices[sellerId]
                }) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-amber-700 text-xs font-medium">
                      ⚠️ Please select fulfillment options for all farms before checkout
                    </p>
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="block w-full text-center py-4 rounded-full text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#7a1515' }}
                >
                  Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span className="text-xs text-gray-400">Secure checkout</span>
                </div>

                <Link
                  href="/explore"
                  className="block text-center text-sm mt-3 hover:underline"
                  style={{ color: '#00674B' }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── You Might Also Like ── */}
      {cartItems.length > 0 && upsellProducts.length > 0 && (
        <section
          className="w-full mt-2"
          style={{ backgroundColor: '#f9f6f0', borderRadius: '16px 16px 0 0', padding: '40px 24px' }}
        >
          {/* Section header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ backgroundColor: '#053D2D' }} />
              <h2
                className="font-raleway font-bold"
                style={{ fontSize: '22px', color: '#053D2D' }}
              >
                You Might Also Like
              </h2>
            </div>
            <p className="text-gray-400 text-sm ml-4">Fresh picks from our farms</p>
          </div>

          {/* Scrollable product row */}
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {upsellProducts.map((product: any) => {
              const priceDisplay = product.pricing_type === 'per_pound'
                ? `$${Number(product.price_per_pound).toFixed(2)}/lb`
                : `$${Number(product.price).toFixed(2)}${product.unit ? `/${product.unit}` : ''}`
              const isAdded = upsellAdded[product.id]

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                  style={{ width: '180px' }}
                >
                  {/* Image */}
                  <Link href={`/product/${product.id}`}>
                    <div className="overflow-hidden bg-gray-100" style={{ height: '160px' }}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Card content */}
                  <div className="p-3">
                    <Link href={`/product/${product.id}`}>
                      <p
                        className="font-medium text-gray-900 leading-snug mb-1 hover:text-green-900 transition-colors"
                        style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {product.name}
                      </p>
                    </Link>

                    {product.seller && (
                      <Link
                        href={product.seller.slug ? `/store/${product.seller.slug}` : '#'}
                        className="block text-xs mb-2 hover:underline truncate"
                        style={{ color: '#00674B' }}
                      >
                        {product.seller.farm_name}
                      </Link>
                    )}

                    {/* Price + Add button */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm" style={{ color: '#053D2D' }}>
                        {priceDisplay}
                      </span>

                      <div className="relative">
                        {isAdded && (
                          <div
                            className="absolute pointer-events-none font-bold text-green-500"
                            style={{ top: '-18px', right: 0, fontSize: '11px', animation: 'floatUp 1.5s ease-out forwards' }}
                          >
                            +1
                          </div>
                        )}
                        <button
                          onClick={() => handleUpsellAdd(product)}
                          className="text-white p-1.5 flex-shrink-0 transition-all duration-300 flex items-center justify-center"
                          style={{
                            backgroundColor: isAdded ? '#16a34a' : '#b91c1c',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            transform: isAdded ? 'scale(1.15)' : 'scale(1)',
                          }}
                          aria-label="Add to cart"
                        >
                          {isAdded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
