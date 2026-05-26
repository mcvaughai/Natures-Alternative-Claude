'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StoreNavbar from '@/components/store/StoreNavbar'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const apiHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const DEFAULT_PRACTICES = [
  'No synthetic pesticides or herbicides',
  'No GMO products',
  'Regenerative farming methods',
  'Pasture raised animals',
  'Seasonal and rotational crops',
  'No artificial hormones or antibiotics',
  'Soil health monitoring and improvement',
]

export default function StoreAboutPage() {
  const params = useParams()
  const slug = params?.id as string

  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) fetchStore()
  }, [slug])

  async function fetchStore() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=*`,
        { headers: apiHeaders }
      )
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setError('Store not found')
      } else {
        setStore(data[0])
      }
    } catch (err) {
      console.error('About page fetch error:', err)
      setError('Error loading store')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (error || !store) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Store not found</h2>
          <Link href="/farms" className="mt-4 inline-block bg-green-900 text-white px-6 py-2 rounded-full">
            Browse All Farms
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )

  /* Resolve fields with fallbacks */
  const bannerUrl = store.about_page_banner_url || store.banner_url
  const ourStoryTitle = store.our_story_title || 'Our Story'
  const ourStoryText = store.our_story_text || store.description || 'We are committed to providing the highest quality natural products, grown and raised with care on our farm.'
  const whoWeAreImage = store.who_we_are_image_url

  /* farming_practices can be string[] or null */
  let practices: string[] = DEFAULT_PRACTICES
  if (store.farming_practices) {
    try {
      const parsed = typeof store.farming_practices === 'string'
        ? JSON.parse(store.farming_practices)
        : store.farming_practices
      if (Array.isArray(parsed) && parsed.length > 0) {
        practices = parsed
      }
    } catch {
      // keep defaults
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <StoreNavbar storeId={slug} activePage="about" />
      <main className="flex-1">

        {/* ── About Hero ── */}
        <div className="w-full relative overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={`${store.farm_name} about`}
              className="w-full h-auto block"
              style={{ objectFit: 'contain', maxHeight: '600px', width: '100%' }}
            />
          ) : (
            <div
              className="w-full bg-gradient-to-r from-green-900 to-green-700 flex items-center justify-center"
              style={{ height: '400px' }}
            >
              <h1 className="text-4xl font-bold text-white">About {store.farm_name}</h1>
            </div>
          )}
        </div>

        <div className="w-full px-6 py-10 space-y-6">

          {/* ── Our Story ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-[#1a4a2e] mb-5">{ourStoryTitle}</h2>
                {ourStoryText.split('\n').filter(Boolean).map((para: string, i: number) => (
                  <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
                ))}
              </div>
              <div className="rounded-xl overflow-hidden aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
                {whoWeAreImage ? (
                  <img
                    src={whoWeAreImage}
                    alt={`${store.farm_name} farm`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* ── Farming Practices ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-[#1a4a2e] mb-6">Our Farming Practices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {practices.map((practice: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[#1a4a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{practice}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* ── Location ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#1a4a2e] mb-4">Find Us</h2>
              <div className="bg-gray-200 rounded-xl h-40 flex items-center justify-center text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{store.farm_name}</p>
                {(store.address || store.city || store.state) && (
                  <p>
                    {[store.address, store.city, store.state].filter(Boolean).join(', ')}
                    {store.zip ? ` ${store.zip}` : ''}
                  </p>
                )}
                {store.pickup_days && (
                  <>
                    <p className="text-[#1a4a2e] font-medium mt-3">Farm Pickup</p>
                    <p>{store.pickup_days}</p>
                  </>
                )}
              </div>
            </div>

            {/* ── Contact ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#1a4a2e] mb-4">Contact the Farm</h2>
              <div className="space-y-4 text-sm">
                {store.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1a4a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Email</p>
                      <a href={`mailto:${store.email}`} className="font-medium text-gray-800 hover:text-[#1a4a2e]">
                        {store.email}
                      </a>
                    </div>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1a4a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Phone</p>
                      <a href={`tel:${store.phone}`} className="font-medium text-gray-800 hover:text-[#1a4a2e]">
                        {store.phone}
                      </a>
                    </div>
                  </div>
                )}
                {!store.email && !store.phone && (
                  <p className="text-gray-400 text-sm">No contact details on file.</p>
                )}
              </div>

              {(store.instagram_url || store.facebook_url || store.twitter_url) && (
                <>
                  <hr className="my-5 border-gray-100" />
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">Follow the Farm</h3>
                  <div className="flex gap-2">
                    {store.instagram_url && (
                      <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#1a4a2e] hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {store.facebook_url && (
                      <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#1a4a2e] hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {store.twitter_url && (
                      <a href={store.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter/X"
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#1a4a2e] hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
