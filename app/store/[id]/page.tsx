'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

export default function StorePage() {
  const params = useParams()
  const slug = params?.id as string
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) fetchStoreData()
  }, [slug])

  async function fetchStoreData() {
    setLoading(true)
    try {
      console.log('Looking for store with slug:', slug)
      const storeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const stores = await storeRes.json()
      console.log('Store fetch status:', storeRes.status)
      console.log('Store fetch result:', JSON.stringify(stores))

      if (!stores || !Array.isArray(stores) || stores.length === 0) {
        setError('Store not found')
        return
      }

      const storeData = stores[0]
      setStore(storeData)

      const productsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${storeData.id}&status=eq.active&select=id,name,price,unit,description,images&order=created_at.desc`,
        { headers }
      )
      const productsData = await productsRes.json()
      console.log('Products fetch status:', productsRes.status)
      console.log('Products data:', productsData)

      if (!Array.isArray(productsData)) {
        console.error('Products data is not an array:', productsData)
        setProducts([])
      } else {
        setProducts(
          productsData.map((product: any) => ({
            ...product,
            primaryImage: Array.isArray(product.images) ? (product.images[0] ?? null) : null,
          }))
        )
      }
    } catch (err: any) {
      console.error('Store error:', err)
      setError('Error loading store')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading store...</p>
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
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="h-12 w-12 bg-transparent flex items-center justify-center">
                <span className="text-green-900 font-bold text-lg">
                  {store.farm_name?.charAt(0)}
                </span>
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
            <Link href={`/store/${slug}/shop`} className="text-sm text-gray-600 hover:text-green-900">Shop</Link>
            <Link href={`/store/${slug}/about`} className="text-sm text-gray-600 hover:text-green-900">About Us</Link>
            <div className="flex items-center gap-3">
              {store.instagram_url && (
                <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors">
                  <FaInstagram size={22} />
                </a>
              )}
              {store.facebook_url && (
                <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <FaFacebook size={22} />
                </a>
              )}
              {store.twitter_url && (
                <a href={store.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-sky-500 transition-colors">
                  <FaTwitter size={22} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="w-full relative overflow-hidden">
        {store.banner_url ? (
          <>
            <img
              src={store.banner_url}
              alt={`${store.farm_name} banner`}
              className="w-full h-auto block"
              style={{ objectFit: 'contain', maxHeight: '600px', width: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/40 to-transparent">
              <h1 className="text-4xl font-bold text-white">{store.farm_name}</h1>
              {store.tagline && (
                <p className="text-white text-lg mt-2 opacity-90">{store.tagline}</p>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-64 bg-gradient-to-r from-green-900 to-green-700 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">{store.farm_name}</h1>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Store Info Card */}
        {store.description && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-green-900 mb-3">About {store.farm_name}</h2>
            <p className="text-gray-600 leading-relaxed">{store.description}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {store.city && store.state && (
                <span className="text-sm text-gray-500">📍 {store.city}, {store.state}</span>
              )}
              {store.year_established && (
                <span className="text-sm text-gray-500">📅 Est. {store.year_established}</span>
              )}
              {store.phone && (
                <span className="text-sm text-gray-500">📞 {store.phone}</span>
              )}
              {store.email && (
                <span className="text-sm text-gray-500">✉️ {store.email}</span>
              )}
              {store.website && (
                <a href={store.website} target="_blank" rel="noreferrer" className="text-sm text-green-700 hover:underline">
                  🌐 Visit Website
                </a>
              )}
            </div>
          </div>
        )}

        {/* Fulfillment Info */}
        {(store.pickup_address || store.pickup_hours) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-green-900 mb-3">Pickup Information</h2>
            {store.pickup_address && (
              <p className="text-gray-600">📍 {store.pickup_address}</p>
            )}
            {store.pickup_hours && (
              <p className="text-gray-600 mt-1">🕐 {store.pickup_hours}</p>
            )}
            {store.pickup_instructions && (
              <p className="text-gray-500 text-sm mt-2">{store.pickup_instructions}</p>
            )}
          </div>
        )}

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-green-900 mb-6">
            Products from {store.farm_name}
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-700">No products yet</h3>
              <p className="text-gray-500 mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product: any) => (
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
                    <h4 className="font-semibold text-sm text-gray-800">{product.name}</h4>
                    <p className="text-green-900 font-bold mt-1">
                      ${product.price}/{product.unit || 'each'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  )
}
