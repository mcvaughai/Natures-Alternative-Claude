'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

export default function DashboardSection() {
  const [session, setSession] = useState<any>(null)
  const [firstName, setFirstName] = useState('there')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    savedItems: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [nearbyFarms, setNearbyFarms] = useState<any[]>([])

  const getHeaders = (token: string) => ({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  })

  useEffect(() => {
    const sessionStr = localStorage.getItem('customer_session')
    if (!sessionStr) { setLoading(false); return }
    const sess = JSON.parse(sessionStr)
    setSession(sess)
    fetchDashboardData(sess)
  }, [])

  const fetchDashboardData = async (sess: any) => {
    try {
      // Fetch profile for name
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${sess.user_id}&select=first_name,last_name`,
        { headers: getHeaders(sess.access_token) }
      )
      const profileData = await profileRes.json()
      if (Array.isArray(profileData) && profileData[0]?.first_name) {
        setFirstName(profileData[0].first_name)
      }

      // Fetch all orders for stats
      const ordersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${sess.user_id}&select=id,status,total_amount,created_at,order_number&order=created_at.desc`,
        { headers: getHeaders(sess.access_token) }
      )
      const ordersData = await ordersRes.json()
      const orders = Array.isArray(ordersData) ? ordersData : []

      setRecentOrders(orders.slice(0, 3))
      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) =>
          o.status === 'pending' || o.status === 'confirmed'
        ).length
      }))

      // Fetch wishlist count
      const wishlistRes = await fetch(
        `${SUPABASE_URL}/rest/v1/wishlist_items?user_id=eq.${sess.user_id}&select=id`,
        { headers: getHeaders(sess.access_token) }
      )
      const wishlistData = await wishlistRes.json()
      setStats(prev => ({
        ...prev,
        savedItems: Array.isArray(wishlistData) ? wishlistData.length : 0
      }))

      // Fetch some approved farms to show
      const farmsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?status=eq.approved&select=id,farm_name,slug,city,state,banner_url,logo_url,fulfillment&limit=3`,
        { headers: getHeaders(sess.access_token) }
      )
      const farmsData = await farmsRes.json()
      setNearbyFarms(Array.isArray(farmsData) ? farmsData : [])

    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':        return { bg: '#f0fdf4', text: '#16a34a' }
      case 'confirmed':        return { bg: '#eff6ff', text: '#2563eb' }
      case 'pending':          return { bg: '#fefce8', text: '#d97706' }
      case 'cancelled':        return { bg: '#fef2f2', text: '#dc2626' }
      case 'ready_for_pickup': return { bg: '#eff6ff', text: '#2563eb' }
      default:                 return { bg: '#f9fafb', text: '#6b7280' }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Welcome Header */}
      <div>
        <h1 className="font-raleway text-3xl font-bold text-gray-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="font-raleway text-3xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
          <Link
            href="/account/orders"
            className="text-xs font-medium mt-2 inline-block hover:underline"
            style={{ color: '#00674B' }}
          >
            View all orders →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
          <p className="font-raleway text-3xl font-bold text-gray-900">
            {stats.pendingOrders}
          </p>
          <Link
            href="/account/orders"
            className="text-xs font-medium mt-2 inline-block hover:underline"
            style={{ color: '#00674B' }}
          >
            Track orders →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Saved Items</p>
          <p className="font-raleway text-3xl font-bold text-gray-900">
            {stats.savedItems}
          </p>
          <Link
            href="/account/wishlist"
            className="text-xs font-medium mt-2 inline-block hover:underline"
            style={{ color: '#00674B' }}
          >
            View wishlist →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-raleway font-bold text-gray-900 text-lg">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium hover:underline"
            style={{ color: '#00674B' }}
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Your orders will appear here once you start shopping
            </p>
            <Link
              href="/explore"
              className="mt-4 inline-block px-6 py-2 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: '#053D2D' }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => {
              const statusColors = getStatusColor(order.status)
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: '#f0fdf4' }}
                    >
                      🛒
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Order #{order.order_number || order.id?.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.text
                      }}
                    >
                      {order.status}
                    </span>
                    <p className="font-bold text-gray-900">
                      ${Number(order.total_amount ?? 0).toFixed(2)}
                    </p>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Farms to Explore */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-raleway font-bold text-gray-900 text-lg">
            Farms to Explore
          </h2>
          <Link
            href="/farms"
            className="text-sm font-medium hover:underline"
            style={{ color: '#00674B' }}
          >
            Browse all farms →
          </Link>
        </div>

        {nearbyFarms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No farms available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {nearbyFarms.map((farm: any) => (
              <Link
                key={farm.id}
                href={`/store/${farm.slug}`}
                className="group rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                {/* Farm Banner */}
                <div className="w-full overflow-hidden" style={{ height: '80px' }}>
                  {farm.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={farm.banner_url}
                      alt={farm.farm_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: '#053D2D' }}
                    >
                      <span className="text-white font-raleway font-bold text-xl">
                        {farm.farm_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm">{farm.farm_name}</p>
                  {farm.city && farm.state && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 {farm.city}, {farm.state}
                    </p>
                  )}
                  {Array.isArray(farm.fulfillment) && farm.fulfillment.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {farm.fulfillment.slice(0, 2).map((method: string) => (
                        <span
                          key={method}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                        >
                          {method === 'Farm Pickup' ? '🚗 Pickup'
                            : method === 'Local Delivery' ? '🚚 Delivery'
                            : '📦 Ships'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📦', label: 'My Orders',  href: '/account/orders'    },
          { icon: '♡',  label: 'Wishlist',   href: '/account/wishlist'  },
          { icon: '📍', label: 'Addresses',  href: '/account/addresses' },
          { icon: '⚙️', label: 'Settings',   href: '/account/settings'  },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
              {link.icon}
            </span>
            <span className="text-sm font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>

    </div>
  )
}
