'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FilterSidebar, { FilterProvider, ActiveFiltersBar } from '@/components/FilterSidebar'
import { useCart } from '@/lib/context/CartContext'
import Image from 'next/image'
import ProductGrid from '@/components/ProductGrid'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

const CATEGORY_SLUG = 'natural-cleaning'
const CATEGORY_NAME = 'Natural Cleaning'
const CATEGORY_DESC = 'Non-toxic, plant-based cleaning products safe for your family and the environment'

export default function NaturalCleaningPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [heroBanner, setHeroBanner] = useState<any>(null)

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
        `${SUPABASE_URL}/rest/v1/products?category_id=eq.${categoryId}&status=eq.active&select=id,name,price,unit,description,images,seller_id&order=created_at.desc`,
        { headers: HEADERS }
      )
      const data = await productsRes.json()
      const prods = Array.isArray(data) ? data : []
      // Fetch sellers separately
      const sellersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,fulfillment`,
        { headers: HEADERS }
      )
      const sellersData = await sellersRes.json()
      const sellersMap: any = {}
      if (Array.isArray(sellersData)) {
        sellersData.forEach((s: any) => { sellersMap[s.id] = s })
      }
      const productsWithSellers = prods.map((p: any) => ({
        ...p,
        sellers: sellersMap[p.seller_id] || null
      }))
      setProducts(productsWithSellers)
      // Fetch category hero banner
      const bannerRes = await fetch(
        `${SUPABASE_URL}/rest/v1/category_banners?category_slug=eq.${CATEGORY_SLUG}&is_active=eq.true&select=*&limit=1`,
        { headers: HEADERS }
      )
      const bannerData = await bannerRes.json()
      if (Array.isArray(bannerData) && bannerData.length > 0) {
        setHeroBanner(bannerData[0])
      }
    } catch (err) {
      console.error('Category fetch error:', err)
      setProducts([])
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
      image: product.images?.[0],
      seller_id: product.seller_id,
      unit: product.unit,
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero — 320px, full width */}
        <div
          className="relative w-full flex items-center justify-center overflow-hidden"
          style={{ height: '320px', backgroundColor: '#053D2D' }}
        >
          {heroBanner?.background_image_url && (
            <>
              <Image
                src={heroBanner.background_image_url}
                alt={heroBanner ? (heroBanner.title || CATEGORY_NAME) : CATEGORY_NAME}
                fill
                className="object-cover"
                priority
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(5,61,45,${heroBanner.overlay_opacity ?? 0.5})` }}
              />
            </>
          )}
          <div className="relative z-10 text-center px-4">
            {(heroBanner ? heroBanner.title : CATEGORY_NAME) && (
              <h1
                className="font-raleway font-bold text-white"
                style={{ fontSize: '40px', lineHeight: '1.2' }}
              >
                {heroBanner ? heroBanner.title : CATEGORY_NAME}
              </h1>
            )}
            {(heroBanner ? heroBanner.subtitle : CATEGORY_DESC) && (
              <p
                className="mt-3 text-white mx-auto"
                style={{ fontSize: '16px', opacity: 0.85, maxWidth: '600px' }}
              >
                {heroBanner ? heroBanner.subtitle : CATEGORY_DESC}
              </p>
            )}
          </div>
        </div>

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
                ) : (
                  <>
                    {products.length > 0 && (
                      <p className="text-sm text-gray-500 mb-4">
                        Showing <span className="font-semibold text-gray-700">{products.length}</span> products
                      </p>
                    )}
                    <ProductGrid
                      products={products}
                      onAddToCart={handleAddToCart}
                      emptyMessage={`No products in ${CATEGORY_NAME} yet`}
                      emptySubMessage="Check back soon as more farms join the platform!"
                    />
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
