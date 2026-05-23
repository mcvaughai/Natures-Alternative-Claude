'use client'

import { useEffect, useState } from 'react'
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

const CATEGORY_SLUG = 'natural-cleaning'
const CATEGORY_NAME = 'Natural Cleaning'
const CATEGORY_DESC = 'Non-toxic, plant-based cleaning products safe for your family and the environment'

export default function NaturalCleaningPage() {
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
        `${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}&status=eq.active&select=id,name,price,unit,description,images,pricing_type,price_per_pound&order=created_at.desc`,
        { headers: HEADERS }
      )
      const data = await productsRes.json()
      setProducts(Array.isArray(data) ? data : [])
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
