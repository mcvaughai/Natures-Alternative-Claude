'use client'

import { useEffect, useState } from 'react'
import SellerLayout from '@/components/seller/SellerLayout'
import { getValidSellerSession } from '@/lib/sessionHelper'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

export default function AnalyticsPage() {
  const [loading, setLoading]   = useState(true)
  const [orders, setOrders]     = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    getValidSellerSession().then((sess) => {
      if (!sess) return
      fetchAnalyticsData(sess)
    })
  }, [])

  async function fetchAnalyticsData(sess: { access_token: string; seller_id: string }) {
    try {
      const headers = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${sess.access_token}`,
        'Content-Type': 'application/json',
      }

      const [ordersRes, productsRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/orders?seller_id=eq.${sess.seller_id}&select=*&order=created_at.desc`,
          { headers }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${sess.seller_id}&select=*`,
          { headers }
        ),
      ])

      const [ordersData, productsData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
      ])

      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalOrders     = orders.length
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalRevenue    = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const avgOrderValue   = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const activeProducts  = products.filter(p => p.status === 'active')
  const recentOrders    = orders.slice(0, 5)

  const ordersByStatus = {
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) return (
    <SellerLayout>
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4a2e] mx-auto" />
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      </div>
    </SellerLayout>
  )

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real data from your store</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-[#1a4a2e] mt-1">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">From completed orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-[#1a4a2e] mt-1">{totalOrders}</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-3xl font-bold text-[#1a4a2e] mt-1">${avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Per completed order</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Active Products</p>
            <p className="text-3xl font-bold text-[#1a4a2e] mt-1">{activeProducts.length}</p>
            <p className="text-xs text-gray-400 mt-1">of {products.length} total</p>
          </div>
        </div>

        {/* Orders by Status + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Orders by Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Orders by Status</h2>
            {totalOrders === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No orders yet</p>
                <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers start buying</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Pending',   count: ordersByStatus.pending,   dot: 'bg-yellow-400' },
                  { label: 'Confirmed', count: ordersByStatus.confirmed, dot: 'bg-blue-400'   },
                  { label: 'Completed', count: ordersByStatus.completed, dot: 'bg-green-500'  },
                  { label: 'Cancelled', count: ordersByStatus.cancelled, dot: 'bg-red-400'    },
                ].map(({ label, count, dot }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${dot}`} />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Your Products</h2>
            {products.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No products yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {products.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm font-medium text-gray-700 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">${product.price}/{product.unit || 'each'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-base font-semibold text-gray-700">No orders yet</h3>
              <p className="text-gray-400 text-sm mt-1">When customers place orders they will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Order #</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="py-3 text-sm font-medium text-gray-900">
                        #{order.order_number || order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm font-semibold text-[#1a4a2e]">
                        ${(order.total_amount ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'completed' ? 'bg-gray-100 text-gray-600'     :
                          order.status === 'confirmed' ? 'bg-green-100 text-green-700'   :
                          order.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600'       :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Growth note */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <h3 className="font-semibold text-[#1a4a2e] mb-1">📊 Analytics Growing With You</h3>
          <p className="text-sm text-green-700">
            Your analytics will become more detailed as you receive orders.
            Charts and graphs for revenue trends, top products and customer
            insights will be added as your store grows.
          </p>
        </div>

      </div>
    </SellerLayout>
  )
}
