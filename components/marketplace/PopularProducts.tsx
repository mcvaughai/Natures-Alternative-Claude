'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}

export default function PopularProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      // Fetch active products limited to 5
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?status=eq.active&select=*&order=created_at.desc&limit=5`,
        { headers }
      )
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setProducts([])
        return
      }

      // Fetch sellers separately
      const sellersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,fulfillment`,
        { headers }
      )
      const sellersData = await sellersRes.json()
      const sellersMap: any = {}
      if (Array.isArray(sellersData)) {
        sellersData.forEach((s: any) => { sellersMap[s.id] = s })
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

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
    </div>
  )

  if (products.length === 0) return null

  return (
    <section className="w-full px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-raleway text-2xl font-bold text-gray-900">Popular Products</h2>
        <Link 
          href="/explore"
          className="text-sm font-medium hover:underline"
          style={{ color: '#00674B' }}
        >
          View All →
        </Link>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px'
      }}>
        {products.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={(p) => console.log('add to cart', p)}
          />
        ))}
      </div>
    </section>
  )
}
