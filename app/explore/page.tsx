'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FilterSidebar, { FilterProvider } from '@/components/FilterSidebar'
import Link from 'next/link'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}

export default function ExplorePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?status=eq.active&select=*&order=created_at.desc`,
        { headers }
      )
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setProducts([])
        return
      }

      const sellerIds = [...new Set(data.map((p: any) => p.seller_id).filter(Boolean))]
      let sellersMap: any = {}

      if (sellerIds.length > 0) {
        const idFilter = sellerIds.map((id: string) => `id=eq.${id}`).join(',')
        const sellersRes = await fetch(
          `${SUPABASE_URL}/rest/v1/sellers?or=(${idFilter})&select=id,farm_name,store_name,slug,fulfillment`,
          { headers }
        )
        const sellersData = await sellersRes.json()
        if (Array.isArray(sellersData)) {
          sellersData.forEach((s: any) => { sellersMap[s.id] = s })
        }
      }

      const productsWithSellers = data.map((p: any) => ({
        ...p,
        sellers: sellersMap[p.seller_id] || null
      }))

      setProducts(productsWithSellers)
    } catch (err) {
      console.error('Error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#FCF7F4' }} className="min-h-screen">
      <Navbar />
      <FilterProvider>
      <div className="w-full px-6 py-8 flex gap-6 items-start">

        {/* Filter Sidebar */}
        <div style={{
          position: 'sticky',
          top: '160px',
          alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
          width: '260px',
          flexShrink: 0
        }}>
          <FilterSidebar />
        </div>

        {/* Products */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">
              Showing <span className="font-semibold text-gray-700">{products.length}</span> results
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-900"></div>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl">
              <p className="text-4xl mb-4">🌿</p>
              <h3 className="text-xl font-bold text-gray-700">No products found</h3>
              <p className="text-gray-400 mt-2">Check back soon!</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px'
            }}>
              {products.map((product: any) => {
                const farmName = product.sellers?.farm_name || product.sellers?.store_name || ''
                const slug = product.sellers?.slug || ''
                const storeLink = slug ? `/store/${slug}` : '#'
                const productLink = `/product/${product.id}`
                const fulfillment = product.sellers?.fulfillment || []
                const offersPickup = Array.isArray(fulfillment) && fulfillment.includes('Farm Pickup')
                const offersDelivery = Array.isArray(fulfillment) && fulfillment.includes('Local Delivery')
                const offersShipping = Array.isArray(fulfillment) && fulfillment.includes('Shipping')
                const priceDisplay = product.pricing_type === 'per_pound'
                  ? `$${product.price_per_pound}/lb`
                  : `$${product.price}${product.unit ? `/${product.unit}` : ''}`

                return (
                  <div
                    key={product.id}
                    className="bg-white flex flex-col overflow-visible shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderRadius: '8px' }}
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
                    <div className="p-3 flex flex-col gap-1.5 flex-1">

                      {/* Product Name */}
                      <Link href={productLink}>
                        <h4 className="font-semibold text-gray-800 hover:text-green-900 transition-colors leading-tight"
                          style={{ fontSize: '14px' }}>
                          {product.name}
                        </h4>
                      </Link>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                        <span className="text-gray-400 ml-1" style={{ fontSize: '10px' }}>(0 reviews)</span>
                      </div>

                      {/* Farm Name + Visit Store */}
                      {farmName && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 truncate" style={{ fontSize: '11px' }}>
                            {farmName}
                          </span>
                          <Link href={storeLink} className="font-medium flex-shrink-0 ml-2 hover:underline" style={{ fontSize: '11px', color: '#00674B' }}>
                            Visit Store
                          </Link>
                        </div>
                      )}

                      {/* Fulfillment Badges */}
                      {(offersPickup || offersDelivery || offersShipping) && (
                        <div className="flex flex-wrap gap-1">
                          {offersPickup && (
                            <span className="text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ fontSize: '10px', backgroundColor: '#16a34a' }}>
                              🚗 Pickup
                            </span>
                          )}
                          {offersDelivery && (
                            <span className="text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ fontSize: '10px', backgroundColor: '#2563eb' }}>
                              🚚 Delivery
                            </span>
                          )}
                          {offersShipping && (
                            <span className="text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ fontSize: '10px', backgroundColor: '#7c3aed' }}>
                              📦 Ships
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price + Cart */}
                      <div className="flex justify-between items-center mt-auto pt-1">
                        <p className="font-bold" style={{ fontSize: '14px', color: '#053D2D' }}>
                          {priceDisplay}
                        </p>
                        <button
                          className="relative text-white p-1.5 flex-shrink-0"
                          style={{ backgroundColor: '#b91c1c', borderRadius: '50%' }}
                          onClick={(e) => e.preventDefault()}
                        >
                          <span className="absolute bg-white rounded-full flex items-center justify-center font-bold"
                            style={{ top: '-6px', right: '-6px', width: '14px', height: '14px', fontSize: '10px', color: '#b91c1c', border: '1.5px solid #b91c1c', lineHeight: '1' }}>
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
              })}
            </div>
          )}
        </div>
      </div>
      </FilterProvider>
      <Footer />
    </div>
  )
}
