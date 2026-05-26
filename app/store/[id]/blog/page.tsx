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

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function StoreBlogPage() {
  const params = useParams()
  const slug = params?.id as string

  const [store, setStore] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) fetchData()
  }, [slug])

  async function fetchData() {
    try {
      const storeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=id,farm_name,slug`,
        { headers: apiHeaders }
      )
      const storeData = await storeRes.json()

      if (!Array.isArray(storeData) || storeData.length === 0) {
        setError('Store not found')
        setLoading(false)
        return
      }

      const seller = storeData[0]
      setStore(seller)

      const postsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/farm_posts?seller_id=eq.${seller.id}&is_published=eq.true&select=*&order=created_at.desc`,
        { headers: apiHeaders }
      )
      const postsData = await postsRes.json()
      setPosts(Array.isArray(postsData) ? postsData : [])
    } catch (err) {
      console.error('Blog page error:', err)
      setError('Error loading blog')
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

  const featuredPost = posts[0] ?? null
  const remainingPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <StoreNavbar storeId={slug} activePage="blog" />
      <main className="flex-1">

        {/* ── Blog Header ── */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="w-full px-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{store.farm_name} Blog</h1>
            <p className="text-gray-500">Stories from the farm</p>
          </div>
        </div>

        <div className="w-full px-6 py-10 space-y-8">

          {posts.length === 0 ? (
            /* ── Empty State ── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-700 mb-2">No posts yet</h2>
              <p className="text-gray-500">Check back soon for stories and updates from the farm.</p>
            </div>
          ) : (
            <>
              {/* ── Featured Post ── */}
              {featuredPost && (() => {
                const featuredImage = Array.isArray(featuredPost.image_urls) ? featuredPost.image_urls[0] : null
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="relative h-56 sm:h-72 bg-gray-200 flex items-center justify-center text-gray-400">
                      {featuredImage ? (
                        <img
                          src={featuredImage}
                          alt={featuredPost.title || 'Featured post'}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#1a4a2e] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span>{formatDate(featuredPost.created_at)}</span>
                        {featuredPost.post_type && (
                          <>
                            <span>·</span>
                            <span className="capitalize">{featuredPost.post_type}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {featuredPost.title || 'Farm Update'}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-5">
                        {featuredPost.excerpt || featuredPost.content?.substring(0, 200) || ''}
                        {!featuredPost.excerpt && featuredPost.content?.length > 200 ? '…' : ''}
                      </p>
                      <Link
                        href={`/store/${slug}/blog/${featuredPost.id}`}
                        className="inline-block bg-[#1a4a2e] hover:bg-[#143d24] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                )
              })()}

              {/* ── Blog Grid ── */}
              {remainingPosts.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-5">More from the Farm</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {remainingPosts.map((post: any) => {
                      const postImage = Array.isArray(post.image_urls) ? post.image_urls[0] : null
                      return (
                        <div
                          key={post.id}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                            {postImage ? (
                              <img
                                src={postImage}
                                alt={post.title || 'Blog post'}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <span>{formatDate(post.created_at)}</span>
                              {post.post_type && (
                                <>
                                  <span>·</span>
                                  <span className="capitalize">{post.post_type}</span>
                                </>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                              {post.title || 'Farm Update'}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                              {post.excerpt || post.content?.substring(0, 120) || ''}
                              {!post.excerpt && post.content?.length > 120 ? '…' : ''}
                            </p>
                            <Link
                              href={`/store/${slug}/blog/${post.id}`}
                              className="text-[#1a4a2e] hover:text-[#143d24] font-semibold text-sm flex items-center gap-1 group"
                            >
                              Read More
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
