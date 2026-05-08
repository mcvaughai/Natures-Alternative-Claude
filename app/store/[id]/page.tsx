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
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {store.facebook_url && (
                <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {store.twitter_url && (
                <a href={store.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-sky-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
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
