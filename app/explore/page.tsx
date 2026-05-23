'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FilterSidebar, { FilterProvider } from '@/components/FilterSidebar'
import ProductCard from '@/components/ProductCard'

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

      const sellersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,store_name,slug,fulfillment`,
        { headers }
      )
      console.log('Sellers response status:', sellersRes.status)
      const sellersRaw = await sellersRes.text()
      console.log('Sellers raw response:', sellersRaw)
      const sellersData = JSON.parse(sellersRaw)
      console.log('Sellers parsed:', sellersData)

      const sellersMap: any = {}
      if (Array.isArray(sellersData)) {
        sellersData.forEach((s: any) => {
          sellersMap[s.id] = s
          console.log('Seller:', s.id, s.farm_name, s.fulfillment)
        })
      }

      const productsWithSellers = data.map((p: any) => ({
        ...p,
        sellers: sellersMap[p.seller_id] || null
      }))

      console.log('First product sellers:', productsWithSellers[0]?.sellers)

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', width: '100%' }}>
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => console.log('add to cart', p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </FilterProvider>
      <Footer />
    </div>
  )
}
