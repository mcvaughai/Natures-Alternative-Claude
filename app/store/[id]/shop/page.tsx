'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

export default function StoreShopPage() {
  const params = useParams()
  const slug = params?.id as string
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (slug) fetchData()
  }, [slug])

  async function fetchData() {
    setLoading(true)
    try {
      const storeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=*`,
        { headers }
      )
      const stores = await storeRes.json()

      if (!stores || stores.length === 0) {
        setError('Store not found')
        return
      }

      const storeData = stores[0]
      setStore(storeData)

      const productsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${storeData.id}&is_active=eq.true&select=*&order=created_at.desc`,
        { headers }
      )
      const productsData = await productsRes.json()

      const productsWithImages = await Promise.all(
        (productsData || []).map(async (product: any) => {
          const imgRes = await fetch(
            `${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${product.id}&select=url,is_primary&order=display_order.asc`,
            { headers }
          )
          const images = await imgRes.json()
          return {
            ...product,
            primaryImage: images?.find((i: any) => i.is_primary)?.url || images?.[0]?.url || null,
          }
        })
      )

      setProducts(productsWithImages)
    } catch (err: any) {
      console.error('Shop error:', err)
      setError('Error loading shop')
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading shop...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Store not found</h2>
          <p className="text-gray-500 mt-2">This store does not exist or is not active</p>
          <Link href="/farms" className="mt-4 inline-block bg-green-900 text-white px-6 py-2 rounded-full">
            Browse All Farms
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />

      {/* Store Secondary Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.farm_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-900 font-bold text-lg">{store.farm_name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="font-bold text-green-900">{store.farm_name}</h2>
              {store.city && store.state && (
                <p className="text-xs text-gray-500">{store.city}, {store.state}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm text-gray-600 hover:text-green-900">Home</Link>
            <Link href={`/store/${slug}/shop`} className="text-sm font-semibold text-green-900 border-b-2 border-green-900 pb-0.5">Shop</Link>
            <Link href={`/store/${slug}/about`} className="text-sm text-gray-600 hover:text-green-900">About Us</Link>
            {store.instagram_url && (
              <a href={store.instagram_url} target="_blank" rel="noreferrer" className="text-sm text-gray-600 hover:text-green-900">Instagram</a>
            )}
            {store.facebook_url && (
              <a href={store.facebook_url} target="_blank" rel="noreferrer" className="text-sm text-gray-600 hover:text-green-900">Facebook</a>
            )}
          </div>
        </div>
      </div>

      {/* Shop Header */}
      <div className="bg-green-900 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Shop {store.farm_name}</h1>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full max-w-md rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-700">
              {search ? 'No products match your search' : 'No products yet'}
            </h3>
            <p className="text-gray-500 mt-2">
              {search ? 'Try a different search term' : 'Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product: any) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {product.primaryImage ? (
                    <img
                      src={product.primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">{product.name}</h4>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-green-900 font-bold mt-2">
                    ${product.price}/{product.unit || 'each'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
