'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import StoreNavbar from '@/components/store/StoreNavbar'
import Footer from '@/components/layout/Footer'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.id as string
  const postId = params?.post_id as string

  const [store, setStore] = useState<any>(null)
  const [post, setPost] = useState<any>(null)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug && postId) fetchData()
  }, [slug, postId])

  const fetchData = async () => {
    try {
      const storeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${slug}&select=id,farm_name,slug,logo_url,banner_url,city,state&limit=1`,
        { headers }
      )
      const storeData = await storeRes.json()
      const storeRecord = Array.isArray(storeData) ? storeData[0] : null
      setStore(storeRecord)

      if (!storeRecord) return

      const [postRes, relatedRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/farm_posts?id=eq.${postId}&seller_id=eq.${storeRecord.id}&select=*&limit=1`,
          { headers }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/farm_posts?seller_id=eq.${storeRecord.id}&published=eq.true&id=neq.${postId}&select=*&limit=3&order=created_at.desc`,
          { headers }
        ),
      ])

      const postData = await postRes.json()
      const relatedData = await relatedRes.json()

      setPost(Array.isArray(postData) ? postData[0] : null)
      setRelatedPosts(Array.isArray(relatedData) ? relatedData : [])
    } catch (err) {
      console.error('Blog post error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-900" />
      </div>
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {store && <StoreNavbar storeId={slug} activePage="blog" />}
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Post not found</h2>
        <Link
          href={`/store/${slug}/blog`}
          className="text-sm font-medium hover:underline"
          style={{ color: '#053D2D' }}
        >
          ← Back to Blog
        </Link>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {store && <StoreNavbar storeId={slug} activePage="blog" />}

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href={`/store/${slug}/blog`}
          className="text-sm font-medium hover:underline inline-flex items-center gap-1 mb-6"
          style={{ color: '#053D2D' }}
        >
          ← Back to {store?.farm_name} Blog
        </Link>

        {/* Post Header */}
        <div className="mb-8">
          {post.tags?.[0] && (
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize"
              style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
            >
              {post.tags[0]}
            </span>
          )}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {store && (
              <>
                <span>·</span>
                <Link
                  href={`/store/${slug}`}
                  className="hover:underline"
                  style={{ color: '#053D2D' }}
                >
                  {store.farm_name}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="w-full overflow-hidden rounded-2xl mb-8" style={{ height: '400px' }}>
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-500 leading-relaxed mb-8 pb-8 border-b border-gray-100 italic">
            {post.excerpt}
          </p>
        )}

        {/* Post Content */}
        <div className="text-gray-700 leading-relaxed space-y-4" style={{ fontSize: '17px', lineHeight: '1.8' }}>
          {post.body?.split('\n').map((paragraph: string, index: number) => (
            paragraph.trim() ? (
              <p key={index} className="text-gray-700">{paragraph}</p>
            ) : (
              <br key={index} />
            )
          ))}
        </div>

        {/* Author Card */}
        {store && (
          <div
            className="mt-12 p-6 rounded-2xl flex items-center gap-4"
            style={{ backgroundColor: '#f0fdf4' }}
          >
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.farm_name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                style={{ backgroundColor: '#053D2D' }}
              >
                {store.farm_name?.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Written by</p>
              <p className="font-bold text-gray-900 text-lg">{store.farm_name}</p>
              {store.city && store.state && (
                <p className="text-sm text-gray-500">📍 {store.city}, {store.state}</p>
              )}
            </div>
            <Link
              href={`/store/${slug}`}
              className="px-5 py-2 rounded-full text-white text-sm font-medium flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#053D2D' }}
            >
              Visit Store
            </Link>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More from {store?.farm_name}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {relatedPosts.map((relPost: any) => (
                <Link
                  key={relPost.id}
                  href={`/store/${slug}/blog/${relPost.id}`}
                  className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {relPost.cover_image ? (
                    <div style={{ height: '120px', overflow: 'hidden' }}>
                      <img
                        src={relPost.cover_image}
                        alt={relPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div
                      style={{ height: '120px', backgroundColor: '#f0fdf4' }}
                      className="flex items-center justify-center"
                    >
                      <span className="text-3xl">📝</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-green-900">
                      {relPost.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(relPost.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
