'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StoreNavbar from '@/components/store/StoreNavbar'
import { useCart } from '@/lib/context/CartContext'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

function ShopProductCard({ product, storeSlug }: { product: any; storeSlug: string }) {
  const [added, setAdded] = useState(false)
  const router = useRouter()
  const { addToCart } = useCart()

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: `$${Number(product.price).toFixed(2)}`,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => router.push(`/product/${product.id}?store=${storeSlug}`)}
    >
      <div className="relative bg-gray-200 aspect-square overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate group-hover:text-[#1a4a2e] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-1 line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1a4a2e] text-sm">${Number(product.price).toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className={`rounded-full p-1.5 transition-colors ${added ? 'bg-[#1a4a2e] hover:bg-[#2d6b47]' : 'bg-[#8b1a1a] hover:bg-[#6d1414]'} text-white`}
            aria-label="Add to cart"
          >
            {added ? (
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
    </div>
  )
}

export default function StoreShopPage() {
  const params = useParams()
  const slug = params?.id as string
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [categories, setCategories] = useState<any[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    if (slug) fetchData()
  }, [slug])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory, sortBy, priceRange])

  async function fetchData() {
    setLoading(true)
    try {
      const storeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=*`,
        { headers }
      )
      const stores = await storeRes.json()
      console.log('Store data:', stores)
      if (!stores || stores.length === 0) return
      const storeData = stores[0]
      setStore(storeData)

      const productsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${storeData.id}&status=eq.active&select=*&order=created_at.desc`,
        { headers }
      )
      const productsData = await productsRes.json()
      console.log('Products data:', productsData)
      const prods = Array.isArray(productsData) ? productsData : []

      // Log all category_ids from products
      const categoryIds = [...new Set(prods.map((p: any) => p.category_id).filter(Boolean))]
      console.log('Unique category IDs:', categoryIds)

      if (categoryIds.length > 0) {
        const categoriesRes = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=id,name,slug`,
          { headers }
        )
        const allCategories = await categoriesRes.json()
        console.log('All categories response:', allCategories)
        console.log('Is array?', Array.isArray(allCategories))

        const farmCategories = Array.isArray(allCategories)
          ? allCategories.filter((cat: any) => categoryIds.includes(cat.id))
          : []
        console.log('Farm categories:', farmCategories)
        setCategories(farmCategories)
      } else {
        console.log('No category IDs found in products!')
      }

      setProducts(prods)
    } catch (err) {
      console.error('Shop error:', err)
    } finally {
      setLoading(false)
    }
  }

  function filterProducts() {
    let filtered = [...products]

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory)
    }

    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max))
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    }

    setFilteredProducts(filtered)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FCF7F4]">
      <Navbar />
      <StoreNavbar storeId={slug} activePage="shop" />
      <div className="flex items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900" />
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FCF7F4]">
      <Navbar />
      <StoreNavbar storeId={slug} activePage="shop" />

      {/* Shop Page Banner */}
      {(store?.shop_banner_url || store?.banner_url) && (
        <div className="w-full relative overflow-hidden">
          <img
            src={store.shop_banner_url || store.banner_url}
            alt={`${store.farm_name} shop`}
            className="w-full h-auto block"
            style={{ objectFit: 'contain', maxHeight: '600px', width: '100%' }}
          />
          {(store?.shop_banner_title || store?.shop_banner_subtitle) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white">
                {store.shop_banner_title && (
                  <h1 className="text-4xl font-bold drop-shadow-lg">
                    {store.shop_banner_title}
                  </h1>
                )}
                {store.shop_banner_subtitle && (
                  <p className="text-lg mt-2 opacity-90 drop-shadow-md">
                    {store.shop_banner_subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">

        {/* LEFT SIDEBAR - Filters */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">

            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-green-900 text-lg">Filters</h2>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setPriceRange({ min: '', max: '' })
                  setSortBy('newest')
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="accent-green-900"
                    />
                    <span className="text-sm text-gray-600">All Products ({products.length})</span>
                  </label>
                  {categories.map((cat: any) => {
                    const count = products.filter(p => p.category_id === cat.id).length
                    return (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="accent-green-900"
                        />
                        <span className="text-sm text-gray-600">
                          {cat.name} ({count})
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                  placeholder="Min $"
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                  placeholder="Max $"
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  { label: 'Under $10', min: '', max: '10' },
                  { label: '$10–$25', min: '10', max: '25' },
                  { label: '$25–$50', min: '25', max: '50' },
                  { label: 'Over $50', min: '50', max: '' },
                ].map(range => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRange({ min: range.min, max: range.max })}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      priceRange.min === range.min && priceRange.max === range.max
                        ? 'bg-green-900 text-white border-green-900'
                        : 'border-gray-300 text-gray-600 hover:border-green-900'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fulfillment */}
            {store?.fulfillment && store.fulfillment.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment</label>
                <div className="space-y-2">
                  {store.fulfillment.map((method: string) => (
                    <label key={method} className="flex items-center gap-2">
                      <input type="checkbox" className="accent-green-900" />
                      <span className="text-sm text-gray-600">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={filterProducts}
              className="w-full bg-green-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* RIGHT - Products Grid */}
        <div className="flex-1 min-w-0">

          {/* Results Header */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">
              Showing <span className="font-semibold text-gray-700">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  {categories.find((c: any) => c.id === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-red-500">×</button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  ${priceRange.min || '0'} – ${priceRange.max || '∞'}
                  <button onClick={() => setPriceRange({ min: '', max: '' })} className="ml-1 hover:text-red-500">×</button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="text-xl font-bold text-gray-700">No products found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setPriceRange({ min: '', max: '' })
                }}
                className="mt-4 bg-green-900 text-white px-6 py-2 rounded-full text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product: any) => (
                <ShopProductCard key={product.id} product={product} storeSlug={slug} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
