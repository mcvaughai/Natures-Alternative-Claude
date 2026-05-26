'use client'
import { useState } from 'react'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    unit?: string
    images?: string[]
    pricing_type?: string
    price_per_pound?: number
    sellers?: {
      farm_name?: string
      slug?: string
      fulfillment?: string[]
    }
  }
  storeSlug?: string
  hideFarmInfo?: boolean
  onAddToCart?: (product: any) => void
}

export default function ProductCard({ product, storeSlug, hideFarmInfo, onAddToCart }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const farmName = product.sellers?.farm_name || ''
  const storeLink = product.sellers?.slug ? `/store/${product.sellers.slug}` : '#'
  const fulfillmentOptions = product.sellers?.fulfillment || []
  const offersPickup = Array.isArray(fulfillmentOptions) && fulfillmentOptions.includes('Farm Pickup')
  const offersDelivery = Array.isArray(fulfillmentOptions) && fulfillmentOptions.includes('Local Delivery')
  const offersShipping = Array.isArray(fulfillmentOptions) && fulfillmentOptions.includes('Shipping')
  const priceDisplay = product.pricing_type === 'per_pound'
    ? `$${product.price_per_pound}/lb`
    : `$${product.price}${product.unit ? `/${product.unit}` : ''}`
  const productLink = storeSlug
    ? `/product/${product.id}?store=${storeSlug}`
    : `/product/${product.id}`

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className="flex flex-col overflow-visible"
      style={{ borderRadius: '8px', width: '100%' }}
    >
      {/* Image */}
      <Link href={productLink}>
        <div
          className="overflow-hidden bg-gray-200"
          style={{ height: '280px', borderRadius: '8px' }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              style={{ borderRadius: '8px' }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-2 pt-3 pb-4 px-1">

        {/* Product Name */}
        <Link href={productLink}>
          <h4
            className="font-urbanist font-semibold hover:text-green-900 transition-colors leading-tight"
            style={{ fontSize: '16px', color: '#111827' }}
          >
            {product.name}
          </h4>
        </Link>

        {/* Star Rating */}
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(star => (
            <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="font-urbanist text-gray-400 ml-1" style={{ fontSize: '11px' }}>(0 reviews) </span>
        </div>

        {/* Farm Name + Visit Store */}
        {farmName && !hideFarmInfo && (
          <div className="flex items-center justify-between">
            <span className="font-urbanist text-gray-500 truncate" style={{ fontSize: '13px', color: '#4b5563' }}>
              {farmName}
            </span>
            <Link
              href={storeLink}
              className="font-medium flex-shrink-0 ml-2 hover:underline"
              style={{ fontSize: '13px', color: '#00674B' }}
            >
              Visit Store
            </Link>
          </div>
        )}

        {/* Fulfillment Badges */}
        {(offersPickup || offersDelivery || offersShipping) && (
          <div className="flex flex-wrap gap-1">
            {offersPickup && (
              <span
                className="font-medium rounded-full flex items-center gap-0.5"
                style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px' }}
              >
                🚗 Pickup
              </span>
            )}
            {offersDelivery && (
              <span
                className="font-medium rounded-full flex items-center gap-0.5"
                style={{ fontSize: '11px', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px' }}
              >
                🚚 Delivery
              </span>
            )}
            {offersShipping && (
              <span
                className="font-medium rounded-full flex items-center gap-0.5"
                style={{ fontSize: '11px', backgroundColor: '#ede9fe', color: '#6d28d9', padding: '2px 8px' }}
              >
                📦 Ships
              </span>
            )}
          </div>
        )}

        {/* Price + Cart Button */}
        <div className="flex justify-between items-center mt-auto pt-1">
          <p className="font-urbanist font-bold" style={{ fontSize: '16px', color: '#053D2D' }}>
            {priceDisplay}
          </p>
          <div className="relative">
            {/* Floating +1 animation */}
            {added && (
              <div
                className="absolute pointer-events-none font-bold text-green-500"
                style={{
                  top: '-20px',
                  right: '0px',
                  fontSize: '12px',
                  animation: 'floatUp 1.5s ease-out forwards'
                }}
              >
                +1
              </div>
            )}
            <button
              className="relative text-white p-1.5 flex-shrink-0 transition-all duration-300"
              style={{
                backgroundColor: added ? '#16a34a' : '#b91c1c',
                borderRadius: '50%',
                transform: added ? 'scale(1.15)' : 'scale(1)'
              }}
              onClick={handleQuickAdd}
            >
              <span
                className="absolute bg-white rounded-full flex items-center justify-center font-bold transition-all duration-300"
                style={{
                  top: '-6px',
                  right: '-6px',
                  width: '14px',
                  height: '14px',
                  fontSize: '10px',
                  color: added ? '#16a34a' : '#b91c1c',
                  border: added ? '1.5px solid #16a34a' : '1.5px solid #b91c1c',
                  lineHeight: '1'
                }}
              >
                {added ? '✓' : '+'}
              </span>
              {added ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
