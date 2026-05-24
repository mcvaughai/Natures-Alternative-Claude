'use client'
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

  return (
    <div
      className="bg-white flex flex-col overflow-visible shadow-sm hover:shadow-md transition-shadow"
      style={{ borderRadius: '8px', width: '100%' }}
    >
      {/* Image */}
      <Link href={productLink}>
        <div
          className="overflow-hidden bg-gray-200"
          style={{ height: '200px', borderRadius: '8px 8px 0 0' }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">

        {/* Product Name */}
        <Link href={productLink}>
          <h4
            className="font-semibold text-gray-800 hover:text-green-900 transition-colors leading-tight"
            style={{ fontSize: '14px' }}
          >
            {product.name}
          </h4>
        </Link>

        {/* Star Rating */}
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(star => (
            <svg key={star} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="text-gray-400 ml-1" style={{ fontSize: '10px' }}>(0 reviews) </span>
        </div>

        {/* Farm Name + Visit Store */}
        {farmName && !hideFarmInfo && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 truncate" style={{ fontSize: '11px' }}>
              {farmName}
            </span>
            <Link
              href={storeLink}
              className="font-medium flex-shrink-0 ml-2 hover:underline"
              style={{ fontSize: '11px', color: '#00674B' }}
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
                className="font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d' }}
              >
                🚗 Pickup
              </span>
            )}
            {offersDelivery && (
              <span
                className="font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}
              >
                🚚 Delivery
              </span>
            )}
            {offersShipping && (
              <span
                className="font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ fontSize: '10px', backgroundColor: '#ede9fe', color: '#6d28d9' }}
              >
                📦 Ships
              </span>
            )}
          </div>
        )}

        {/* Price + Cart Button */}
        <div className="flex justify-between items-center mt-auto pt-1">
          <p className="font-bold" style={{ fontSize: '14px', color: '#053D2D' }}>
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
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
