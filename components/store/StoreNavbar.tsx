'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

interface StoreData {
  farm_name: string
  city?: string
  state?: string
  logo_url?: string
  instagram_url?: string
  facebook_url?: string
  twitter_url?: string
}

interface StoreNavbarProps {
  storeId: string
  activePage?: 'home' | 'shop' | 'about' | 'blog'
}

const NAV_LINKS = [
  { key: 'home' as const,  label: 'Home',     path: '' },
  { key: 'shop' as const,  label: 'Shop',     path: '/shop' },
  { key: 'about' as const, label: 'About Us', path: '/about' },
  { key: 'blog' as const,  label: 'Blog',     path: '/blog' },
]

export default function StoreNavbar({ storeId, activePage }: StoreNavbarProps) {
  const [store, setStore] = useState<StoreData | null>(null)

  useEffect(() => {
    if (!storeId) return
    fetch(
      `${SUPABASE_URL}/rest/v1/sellers?slug=eq.${storeId}&select=farm_name,city,state,logo_url,instagram_url,facebook_url,twitter_url`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setStore(data[0])
      })
      .catch(() => {})
  }, [storeId])

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">

        {/* Logo + farm name */}
        <Link href={`/store/${storeId}`} className="flex items-center gap-3 shrink-0">
          {store?.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.farm_name}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-[#1a4a2e]/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[#1a4a2e] font-bold text-base">
                {store?.farm_name?.charAt(0) ?? '…'}
              </span>
            </div>
          )}
          <div className="leading-tight hidden sm:block">
            {store ? (
              <>
                <p className="text-sm font-bold text-gray-900 leading-none">{store.farm_name}</p>
                {store.city && store.state && (
                  <p className="text-xs text-gray-500 mt-0.5">{store.city}, {store.state}</p>
                )}
              </>
            ) : (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            )}
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 ml-auto">
          {NAV_LINKS.map(({ key, label, path }) => {
            const isActive = activePage === key
            return (
              <Link
                key={key}
                href={`/store/${storeId}${path}`}
                className={`transition-colors pb-0.5 ${
                  isActive
                    ? 'text-[#1a4a2e] font-semibold border-b-2 border-[#1a4a2e]'
                    : 'hover:text-[#1a4a2e]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Social icons */}
        <div className="hidden md:flex items-center gap-3 ml-5">
          {store?.instagram_url && (
            <a
              href={store.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {store?.facebook_url && (
            <a
              href={store.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          )}
          {store?.twitter_url && (
            <a
              href={store.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-gray-400 hover:text-sky-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
        </div>

        {/* Mobile hamburger placeholder */}
        <button className="md:hidden ml-auto p-2 text-gray-500 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

      </div>
    </nav>
  )
}
