"use client";

import { useState, useEffect } from "react";
import { getValidAdminSession } from "@/lib/sessionHelper";
import AdminLayout from "@/components/admin/AdminLayout";

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs';

const getHeaders = (token: string) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    activeSellers: 0,
  });
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (sess: any) => {
    try {
      const [ordersRes, sellersRes, profilesRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,status`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,role,created_at`,
          { headers: getHeaders(sess.access_token) }),
      ]);

      const orders = await ordersRes.json();
      const sellers = await sellersRes.json();
      const profiles = await profilesRes.json();

      const ordersArr = Array.isArray(orders) ? orders : [];
      const sellersArr = Array.isArray(sellers) ? sellers : [];
      const profilesArr = Array.isArray(profiles) ? profiles : [];

      const completedOrders = ordersArr.filter((o: any) => o.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum: number, o: any) =>
        sum + (o.total_amount || 0), 0);

      setStats({
        totalRevenue,
        totalOrders: ordersArr.length,
        completedOrders: completedOrders.length,
        pendingOrders: ordersArr.filter((o: any) => o.status === 'pending').length,
        totalCustomers: profilesArr.filter((p: any) => p.role === 'customer').length,
        activeSellers: sellersArr.filter((s: any) => s.status === 'approved').length,
      });

      setRecentOrders(ordersArr.slice(0, 5));

      const revenuePerSeller: any = {};
      completedOrders.forEach((o: any) => {
        if (!revenuePerSeller[o.seller_id]) revenuePerSeller[o.seller_id] = 0;
        revenuePerSeller[o.seller_id] += o.total_amount || 0;
      });

      const topSellersList = sellersArr
        .map((s: any) => ({
          ...s,
          revenue: revenuePerSeller[s.id] || 0,
          orderCount: ordersArr.filter((o: any) => o.seller_id === s.id).length,
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopSellers(topSellersList);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getValidAdminSession();
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) { window.location.href = '/admin/login'; return; }
    const sess = JSON.parse(sessionStr);
    fetchAnalytics(sess);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#053D2D' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Platform Analytics</h1>
        </div>

        {/* Stats row — 6 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue',      value: `$${stats.totalRevenue.toFixed(2)}`,       color: 'text-[#053D2D]' },
            { label: 'Total Orders',       value: String(stats.totalOrders),                 color: 'text-[#053D2D]' },
            { label: 'Completed Orders',   value: String(stats.completedOrders),             color: 'text-green-700' },
            { label: 'Pending Orders',     value: String(stats.pendingOrders),               color: 'text-yellow-600' },
            { label: 'Total Customers',    value: String(stats.totalCustomers),              color: 'text-[#053D2D]' },
            { label: 'Active Sellers',     value: String(stats.activeSellers),               color: 'text-[#053D2D]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Top Sellers + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Sellers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Top Sellers by Revenue</h2>
            {topSellers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="font-medium">No sales data yet</p>
                <p className="text-sm mt-1">Revenue will appear here when orders are completed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSellers.map((seller: any, i: number) => (
                  <div key={seller.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{seller.farm_name}</span>
                    <span className="text-xs text-gray-400">{seller.orderCount} orders</span>
                    <span className="text-sm font-bold" style={{ color: '#053D2D' }}>
                      ${seller.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-800">
                      #{order.order_number || order.id?.slice(0, 8)}
                    </span>
                    <span className="flex-1 text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      ${order.total_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
