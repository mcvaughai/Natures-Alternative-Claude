'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from '@/components/FilterSidebar'
import { useCart } from '@/lib/context/CartContext'
import ProductGrid from '@/components/ProductGrid'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const CATEGORY_SLUG = 'herbs-botanicals'
const CATEGORY_NAME = 'Herbs & Botanicals'
const CATEGORY_DESC = 'Fresh and dried herbs, botanical extracts and herbal products from natural farms'

export default function HerbsBotanicalsPage() {
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
        `${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}&status=eq.active&select=id,name,price,unit,description,images,seller_id&order=created_at.desc`,
        { headers: HEADERS }
      )
      const data = await productsRes.json()
      const prods = Array.isArray(data) ? data : []
      // Fetch sellers separately
      const sellersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,fulfillment`,
        { headers: HEADERS }
      )
      const sellersData = await sellersRes.json()
      const sellersMap: any = {}
      if (Array.isArray(sellersData)) {
        sellersData.forEach((s: any) => { sellersMap[s.id] = s })
      }
      const productsWithSellers = prods.map((p: any) => ({
        ...p,
        sellers: sellersMap[p.seller_id] || null
      }))
      setProducts(productsWithSellers)
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
      image: product.images?.[0],
      seller_id: product.seller_id,
      unit: product.unit,
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page title */}
        <div
          className="w-full px-6 py-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f0f7f3 0%, #ffffff 60%)' }}
        >
          <nav className="flex items-center gap-1.5 mb-1" style={{ fontSize: '13px', color: '#6b7280' }}>

            <Link href="/" className="hover:underline" style={{ color: '#6b7280' }}>Home</Link>

            <span style={{ color: '#9ca3af' }}>›</span>

            <span>{CATEGORY_NAME}</span>

          </nav>

          <h1
            className="font-raleway font-bold category-header-title relative z-10"
            style={{ fontSize: '30px', color: '#111827' }}
          >
            {CATEGORY_NAME}
          </h1>

          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', maxWidth: '600px' }}>

            {CATEGORY_DESC}

          </p>
        </div>

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
                    <ProductGrid
                      products={products}
                      onAddToCart={handleAddToCart}
                      emptyMessage={`No products in ${CATEGORY_NAME} yet`}
                      emptySubMessage="Check back soon as more farms join the platform!"
                    />
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
