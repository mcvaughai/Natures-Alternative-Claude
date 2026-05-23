'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from '@/components/FilterSidebar'
import { useCart } from '@/lib/context/CartContext'
import ProductCard from '@/components/ProductCard'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const CATEGORY_SLUG = 'natural-skincare'
const CATEGORY_NAME = 'Natural Skincare'
const CATEGORY_DESC = 'Handcrafted skincare made with natural and organic ingredients'

export default function NaturalSkincarePage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const catRes = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?slug=eq.${CATEGORY_SLUG}&select=id,name`,
        { headers: HEADERS }
      )
      const categories = await catRes.json()
      if (!Array.isArray(categories) || categories.length === 0) {
        setProducts([])
        return
      }
      const categoryId = categories[0].id
      const productsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}&status=eq.active&select=*&order=created_at.desc`,
        { headers: HEADERS }
      )
      let data = await productsRes.json()
      if (!Array.isArray(data)) { setProducts([]); return }

      const sellersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,store_name,slug,fulfillment`,
        { headers: HEADERS }
      )
      const sellersData = await sellersRes.json()
      const sellersMap: any = {}
      if (Array.isArray(sellersData)) {
        sellersData.forEach((s: any) => { sellersMap[s.id] = s })
      }
      setProducts(data.map((p: any) => ({ ...p, sellers: sellersMap[p.seller_id] || null })))
    } catch (err) {
      console.error('Category fetch error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  function handleAddToCart(product: any) {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      price: `$${Number(product.price).toFixed(2)}`,
    })
  }

  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#1a4a2e] py-14 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{CATEGORY_NAME}</h1>
            <p className="text-[#f5f0e8] opacity-90">{CATEGORY_DESC}</p>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="w-full px-6 py-8">
          <FilterProvider>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <FilterSidebar category={CATEGORY_SLUG} />
              <div className="flex-1 min-w-0">
                <ActiveFiltersBar />
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <>
                    {products.length > 0 && (
                      <p className="text-sm text-gray-500 mb-4">
                        Showing <span className="font-semibold text-gray-700">{products.length}</span> products
                      </p>
                    )}
                    {products.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-xl">
                        <p className="text-4xl mb-4">🌿</p>
                        <h3 className="text-xl font-bold text-gray-700">{`No products in ${CATEGORY_NAME} yet`}</h3>
                        <p className="text-gray-400 mt-2">Check back soon as more farms join the platform!</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', width: '100%' }}>
                        {products.map((product: any) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </FilterProvider>
        </div>
      </main>
      <Footer />
    </div>
  )
}
