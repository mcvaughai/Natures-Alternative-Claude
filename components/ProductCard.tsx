'use client'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    unit?: string
    description?: string
    images?: string[]
    pricing_type?: string
    price_per_pound?: number
    sellers?: {
      store_name?: string
      farm_name?: string
      slug?: string
      fulfillment?: string[]
    }
  }
  storeSlug?: string
  onAddToCart?: (product: any) => void
}

export default function ProductCard({ product, storeSlug, onAddToCart }: ProductCardProps) {
  const farmName = product.sellers?.farm_name || product.sellers?.store_name || ''
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

  return (
    <div
      className="bg-white flex flex-col overflow-visible shadow-sm hover:shadow-md transition-shadow"
      style={{
        borderRadius: '8px',
        width: '100%'
      }}
    >
      {/* Image Container - fixed height */}
      <Link href={productLink}>
        <div
          className="overflow-hidden bg-gray-200"
          style={{
            height: '200px',
            borderRadius: '8px 8px 0 0'
          }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={productLink}>
          <h4 className="font-semibold text-sm text-gray-800 truncate hover:text-green-900 transition-colors">
            {product.name}
          </h4>
        </Link>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="text-xs text-gray-400 ml-1">
            (0 reviews)
          </span>
        </div>

        {farmName && (
          <div className="flex items-center justify-between mt-1">
            <Link
              href={storeLink}
              className="text-xs text-gray-400 hover:text-green-900 transition-colors truncate"
            >
              {farmName}
            </Link>
            <Link
              href={storeLink}
              className="text-xs font-medium ml-2 flex-shrink-0"
              style={{ color: '#00674B' }}
            >
              Visit Store
            </Link>
          </div>
        )}

        {/* Fulfillment Badges */}
        {(offersPickup || offersDelivery || offersShipping) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {offersPickup && (
              <span
                className="text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ fontSize: '10px', backgroundColor: '#16a34a' }}
              >
                🚗 Pickup
              </span>
            )}
            {offersDelivery && (
              <span
                className="text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ fontSize: '10px', backgroundColor: '#2563eb' }}
              >
                🚚 Delivery
              </span>
            )}
            {offersShipping && (
              <span
                className="text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ fontSize: '10px', backgroundColor: '#7c3aed' }}
              >
                📦 Ships
              </span>
            )}
          </div>
        )}

        {/* Price and Cart */}
        <div className="flex justify-between items-center mt-auto pt-2">
          <p className="text-sm font-bold" style={{ color: '#053D2D' }}>
            {priceDisplay}
          </p>
          <button
            className="relative text-white p-1.5 flex-shrink-0"
            style={{ backgroundColor: '#b91c1c', borderRadius: '50%' }}
            onClick={(e) => {
              e.preventDefault()
              if (onAddToCart) onAddToCart(product)
            }}
          >
            <span
              className="absolute bg-white rounded-full flex items-center justify-center font-bold"
              style={{
                top: '-6px',
                right: '-6px',
                width: '14px',
                height: '14px',
                fontSize: '10px',
                color: '#b91c1c',
                border: '1.5px solid #b91c1c',
                lineHeight: '1'
              }}
            >
              +
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
