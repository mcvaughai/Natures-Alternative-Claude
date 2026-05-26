'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StoreNavbar from '@/components/store/StoreNavbar'
import { useCart } from '@/lib/context/CartContext'
import ProductGrid from '@/components/ProductGrid'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const PLACEHOLDER_REVIEWS = [
  {
    id: 1,
    text: 'Amazing grass-fed beef! You can really taste the difference from store bought. My family loves the ribeye steaks.',
    author: 'Sarah M.',
  },
  {
    id: 2,
    text: 'Best eggs I have ever had. The yolks are so rich and orange. Will never go back to grocery store eggs again!',
    author: 'Mike R.',
  },
]

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ClickableStars({ rating, setRating }: { rating: number; setRating: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function StorePage() {
  const params = useParams()
  const slug = params?.id as string
  const { addToCart } = useCart()
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)

  useEffect(() => {
    if (slug) fetchStoreData()
  }, [slug])

  async function fetchStoreData() {
    setLoading(true)
    try {
      const storeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=*`,
        { headers }
      )
      const stores = await storeRes.json()

      if (!stores || !Array.isArray(stores) || stores.length === 0) {
        setError('Store not found')
        return
      }

      const storeData = stores[0]
      setStore(storeData)

      const [productsRes, postsRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${storeData.id}&status=eq.active&select=*&order=created_at.asc&limit=4`,
          { headers }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/farm_posts?seller_id=eq.${storeData.id}&is_published=eq.true&select=*&order=created_at.desc&limit=4`,
          { headers }
        ),
      ])

      const productsData = await productsRes.json()
      const postsData = await postsRes.json()

      if (!Array.isArray(productsData)) {
        setProducts([])
      } else {
        // Attach seller data to products for fulfillment badges
        const productsWithSeller = productsData.map((product: any) => ({
          ...product,
          primaryImage: Array.isArray(product.images) ? (product.images[0] ?? null) : null,
          sellers: {
            farm_name: storeData.farm_name,
            slug: storeData.slug,
            fulfillment: storeData.fulfillment || []
          }
        }))
        setProducts(productsWithSeller)
      }

      setBlogPosts(Array.isArray(postsData) ? postsData : [])
    } catch (err: any) {
      console.error('Store error:', err)
      setError('Error loading store')
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

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto" />
          <p className="mt-4 text-gray-500">Loading store...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen bg-white">
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

  const heroTitle = store.hero_text || store.farm_name
  const heroSubtitle = store.hero_subtext || store.tagline
  const missionTitle = store.mission_title || store.tagline || store.farm_name
  const missionText = store.mission_text || store.description
  const whoWeAreTitle = store.who_we_are_title || store.farm_name
  const whoWeAreText = store.who_we_are_text || store.description || 'We are passionate about providing the highest quality natural products straight from our farm to your table. Every item is grown and raised with care, without synthetic chemicals or shortcuts.'
  const whoWeAreImage = store.who_we_are_image_url

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── 1. STORE SECONDARY NAVBAR ── */}
      <StoreNavbar storeId={slug} activePage="home" />

      {/* ── 2. HERO BANNER ── */}
      <div className="w-full relative overflow-hidden">
        {store.banner_url ? (
          <>
            <img
              src={store.banner_url}
              alt={`${store.farm_name} banner`}
              className="w-full h-auto block"
              style={{ objectFit: 'contain', maxHeight: '600px', width: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
              <h1 className="font-raleway text-4xl font-bold text-white">{heroTitle}</h1>
              {heroSubtitle && (
                <p className="text-white text-lg mt-2 opacity-90">{heroSubtitle}</p>
              )}
              <Link
                href={`/store/${slug}/shop`}
                className="mt-4 inline-block bg-white text-green-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </>
        ) : (
          <div className="w-full h-80 bg-gradient-to-r from-green-900 to-green-700 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl font-bold text-white">{heroTitle}</h1>
            {heroSubtitle && (
              <p className="text-white text-lg mt-2 opacity-90">{heroSubtitle}</p>
            )}
            <Link
              href={`/store/${slug}/shop`}
              className="mt-6 inline-block bg-white text-green-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        )}
      </div>

      {/* ── 3. SHOP OUR BESTSELLERS ── */}
      <section className="w-full px-6 py-14">
        <h2 className="font-raleway text-3xl font-black text-center tracking-widest uppercase text-gray-900 mb-4">
          Shop Our Bestsellers
        </h2>
        <hr className="border-gray-300 mb-10" />

        <ProductGrid
          products={products}
          storeSlug={slug}
          hideFarmInfo={true}
          onAddToCart={handleAddToCart}
          emptyMessage="No products yet"
          emptySubMessage="Check back soon!"
        />

        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href={`/store/${slug}/shop`}
              className="inline-block bg-green-900 text-white px-10 py-3 rounded-full font-medium hover:bg-green-800 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}
      </section>

      {/* ── 4. MISSION SECTION ── */}
      <section className="bg-[#f0ebe0] border-y border-[#ddd5c5] py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-raleway text-3xl font-black text-gray-900 mb-5">
            {missionTitle}
          </h2>
          {missionText && (
            <p className="font-urbanist text-gray-600 leading-relaxed text-base mb-6">
              {missionText}
            </p>
          )}
          <Link
            href={`/store/${slug}/about`}
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Learn More About Us
          </Link>
        </div>
      </section>

      {/* ── 5. WHO WE ARE AND WHAT WE DO ── */}
      <section className="w-full px-6 py-14">
        <h2 className="text-3xl font-black text-center tracking-widest uppercase text-gray-900 mb-4">
          Who We Are And What We Do
        </h2>
        <hr className="border-gray-300 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: image */}
          <div className="rounded-2xl overflow-hidden aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
            {whoWeAreImage ? (
              <img
                src={whoWeAreImage}
                alt={`${store.farm_name} farm`}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-20 h-20 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {/* Right: text */}
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl font-bold text-gray-900">{whoWeAreTitle}</h3>
            <p className="text-gray-600 leading-relaxed">
              {whoWeAreText}
            </p>
            {store.city && store.state && (
              <p className="text-sm text-gray-500">📍 {store.city}, {store.state}</p>
            )}
            <div>
              <Link
                href={`/store/${slug}/about`}
                className="inline-block bg-gray-900 text-white px-7 py-3 rounded-full font-medium hover:bg-gray-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 mt-14" />
      </section>

      {/* ── 6. WHAT PEOPLE THINK OF US ── */}
      <section className="w-full px-6 pb-14">
        <h2 className="text-3xl font-black text-center tracking-widest uppercase text-gray-900 mb-4">
          What People Think Of Us
        </h2>
        <hr className="border-gray-300 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: review cards */}
          <div className="space-y-5">
            {PLACEHOLDER_REVIEWS.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Review:</p>
                <p className="text-gray-700 leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <StarRating />
                <p className="text-sm font-semibold text-gray-500 mt-3">{review.author}</p>
              </div>
            ))}
          </div>

          {/* Right: write a review */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-900">Share your thoughts!</h3>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              placeholder="Write your review..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-900/30 focus:border-green-900 resize-none"
            />
            <div>
              <p className="text-sm text-gray-500 mb-2">Your rating:</p>
              <ClickableStars rating={reviewRating} setRating={setReviewRating} />
            </div>
            <button
              type="button"
              className="self-start bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        <hr className="border-gray-200 mt-14" />
      </section>

      {/* ── 7. DISCOVER MORE ABOUT US ── */}
      <section className="w-full px-6 pb-16">
        <h2 className="text-3xl font-black text-center tracking-widest uppercase text-gray-900 mb-4">
          Discover More About Us
        </h2>
        <hr className="border-gray-300 mb-10" />

        {blogPosts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Link
                key={i}
                href={`/store/${slug}/blog`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-400">
                  <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-gray-800 mb-1">Coming Soon</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">Stay tuned for updates from our farm</p>
                  <span className="text-[#1a4a2e] text-xs font-semibold group-hover:underline">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {blogPosts.map((post: any) => {
              const firstImage = Array.isArray(post.image_urls) ? post.image_urls[0] : null
              return (
                <Link
                  key={post.id}
                  href={`/store/${slug}/blog/${post.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={post.title || 'Blog post'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2">
                      {post.title || 'Farm Update'}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {post.excerpt || post.content?.substring(0, 80) || 'Read the latest from our farm.'}
                    </p>
                    <span className="text-[#1a4a2e] text-xs font-semibold group-hover:underline">
                      Read More →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
