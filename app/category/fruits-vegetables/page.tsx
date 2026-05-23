'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from '@/components/FilterSidebar'
import { useCart } from '@/lib/context/CartContext'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const CATEGORY_SLUG = 'fruits-vegetables'
const CATEGORY_NAME = 'Fruits & Vegetables'
const CATEGORY_DESC = 'Fresh, seasonal produce grown without synthetic pesticides — straight from the farm'

function ProductGrid({ products }: { products: any[] }) {
  const { addToCart } = useCart()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  function handleAddToCart(e: React.MouseEvent, product: any) {
    e.preventDefault()
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      price: `$${Number(product.price).toFixed(2)}`,
    })
    setAddedIds((prev) => new Set([...prev, product.id]))
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 1000)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className="bg-white rounded-xl overflow-visible shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="h-48 bg-gray-200 rounded-t-xl overflow-hidden">
            {product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-800 truncate group-hover:text-[#1a4a2e] transition-colors">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-bold text-[#1a4a2e]">
                ${Number(product.price).toFixed(2)}{product.unit ? `/${product.unit}` : ''}
              </p>
              <button
                className={`relative text-white p-1.5 rounded-full transition-colors ${
                  addedIds.has(product.id) ? 'bg-[#1a4a2e]' : 'bg-[#8b1a1a] hover:bg-[#6d1414]'
                }`}
                onClick={(e) => handleAddToCart(e, product)}
                aria-label="Add to cart"
              >
                {!addedIds.has(product.id) && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-white text-[#8b1a1a] rounded-full flex items-center justify-center font-bold"
                    style={{ width: '14px', height: '14px', fontSize: '10px', lineHeight: '1', border: '1.5px solid #b91c1c' }}
                  >
                    +
                  </span>
                )}
                {addedIds.has(product.id) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function FruitsVegetablesPage() {
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
        `${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}&status=eq.active&select=id,name,price,unit,description,images&order=created_at.desc`,
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
                ) : products.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <p className="text-4xl mb-4">🌿</p>
                    <h3 className="text-xl font-bold text-gray-700">No products in {CATEGORY_NAME} yet</h3>
                    <p className="text-gray-400 mt-2 text-sm">Check back soon as more farms join the platform!</p>
                    <Link
                      href="/explore"
                      className="mt-4 inline-block bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-6 py-2 rounded-full font-medium transition-colors"
                    >
                      Browse All Products
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Showing <span className="font-semibold text-gray-700">{products.length}</span> products
                    </p>
                    <ProductGrid products={products} />
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
