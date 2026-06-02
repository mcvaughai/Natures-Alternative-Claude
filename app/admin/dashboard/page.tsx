"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getValidAdminSession } from "@/lib/sessionHelper";

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs';

const getHeaders = (token: string) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  shipped:   'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

function StatCard({ label, value, sub, color = 'text-[#053D2D]', urgent }: {
  label: string; value: string; sub: string; color?: string; urgent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
      <div className="flex items-center gap-1.5">
        {urgent && <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />}
        <p className={`text-xs ${urgent ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>{sub}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    totalOrders: 0,
    thisMonthOrders: 0,
    activeSellers: 0,
    pendingApplications: 0,
    totalCustomers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topFarms, setTopFarms] = useState<any[]>([]);
  const [pendingApps, setPendingApps] = useState<any[]>([]);

  const fetchDashboardData = async (sess: any) => {
    try {
      const [ordersRes, sellersRes, profilesRes, productsRes, appsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,status&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,role,created_at`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/products?select=id,status&status=eq.active`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/seller_applications?status=eq.pending&select=id,farm_name,owner_name,city,state,created_at&order=created_at.desc&limit=3`,
          { headers: getHeaders(sess.access_token) }),
      ]);

      const [orders, sellers, profiles, products, apps] = await Promise.all([
        ordersRes.json(), sellersRes.json(),
        profilesRes.json(), productsRes.json(),
        appsRes.json(),
      ]);

      const ordersArr   = Array.isArray(orders)   ? orders   : [];
      const sellersArr  = Array.isArray(sellers)   ? sellers  : [];
      const profilesArr = Array.isArray(profiles)  ? profiles : [];
      const productsArr = Array.isArray(products)  ? products : [];
      const appsArr     = Array.isArray(apps)      ? apps     : [];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const completedOrders  = ordersArr.filter((o: any) => o.status === 'completed');
      const totalRevenue     = completedOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const thisMonthOrders  = ordersArr.filter((o: any) => new Date(o.created_at) >= startOfMonth);
      const thisMonthRevenue = thisMonthOrders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      setStats({
        totalRevenue,
        thisMonthRevenue,
        totalOrders:          ordersArr.length,
        thisMonthOrders:      thisMonthOrders.length,
        activeSellers:        sellersArr.filter((s: any) => s.status === 'approved').length,
        pendingApplications:  appsArr.length,
        totalCustomers:       profilesArr.filter((p: any) => p.role === 'customer').length,
        totalProducts:        productsArr.length,
        avgOrderValue,
      });

      setRecentOrders(ordersArr.slice(0, 5));
      setPendingApps(appsArr);

      const revenuePerSeller: any = {};
      const ordersPerSeller: any  = {};
      completedOrders.forEach((o: any) => {
        if (!revenuePerSeller[o.seller_id]) {
          revenuePerSeller[o.seller_id] = 0;
          ordersPerSeller[o.seller_id]  = 0;
        }
        revenuePerSeller[o.seller_id] += o.total_amount || 0;
        ordersPerSeller[o.seller_id]++;
      });

      const topFarmsList = sellersArr
        .filter((s: any) => s.status === 'approved')
        .map((s: any) => ({
          ...s,
          revenue:    revenuePerSeller[s.id] || 0,
          orderCount: ordersPerSeller[s.id]  || 0,
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 4);

      setTopFarms(topFarmsList);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getValidAdminSession();
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) { window.location.href = '/admin/login'; return; }
    const sess = JSON.parse(sessionStr);
    fetchDashboardData(sess);
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
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-1">{today}</p>
        </div>

        {/* Stats row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue"      value={`$${stats.totalRevenue.toFixed(2)}`}      sub="All time" />
          <StatCard label="This Month Revenue" value={`$${stats.thisMonthRevenue.toFixed(2)}`}  sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} />
          <StatCard label="Total Orders"       value={String(stats.totalOrders)}                sub="All time" />
          <StatCard label="This Month Orders"  value={String(stats.thisMonthOrders)}            sub={new Date().toLocaleString('default', { month: 'long' })} />
        </div>

        {/* Stats row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Sellers"       value={String(stats.activeSellers)}        sub="Approved farms" />
          <StatCard label="Pending Applications" value={String(stats.pendingApplications)}  sub="Awaiting review" color="text-orange-500" urgent={stats.pendingApplications > 0} />
          <StatCard label="Total Customers"      value={String(stats.totalCustomers)}       sub="Registered users" />
          <StatCard label="Total Products"       value={String(stats.totalProducts)}        sub="Active listings" />
        </div>

        {/* Pending Applications + Recent Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Pending Applications */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Pending Applications</h2>
                {stats.pendingApplications > 0 && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats.pendingApplications}
                  </span>
                )}
              </div>
              <Link href="/admin/dashboard/applications" className="text-xs font-semibold hover:underline" style={{ color: '#053D2D' }}>
                View All
              </Link>
            </div>

            {pendingApps.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">✅</p>
                <p>No pending applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApps.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{app.farm_name}</p>
                      <p className="text-xs text-gray-500">{app.owner_name} · {app.city}, {app.state}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/dashboard/applications')}
                      className="shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: '#053D2D' }}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Recent Platform Orders</h2>
              <Link href="/admin/dashboard/analytics" className="text-xs font-semibold hover:underline" style={{ color: '#053D2D' }}>
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">📋</p>
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      #{order.order_number || order.id?.slice(0, 8)}
                    </p>
                    <p className="flex-1 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-bold text-gray-800 tabular-nums whitespace-nowrap">
                      ${order.total_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Health + Top Farms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Platform Health</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Order Value',  value: `$${stats.avgOrderValue.toFixed(2)}` },
                { label: 'Active Listings',  value: String(stats.totalProducts)          },
                { label: 'Active Sellers',   value: String(stats.activeSellers)          },
                { label: 'Total Customers',  value: String(stats.totalCustomers)         },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: '#053D2D' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Farms */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Top Performing Farms</h2>

            {topFarms.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">🌾</p>
                <p>No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topFarms.map((farm: any, index: number) => (
                  <div key={farm.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{farm.farm_name}</p>
                      <p className="text-xs text-gray-500">{farm.orderCount} orders</p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: '#053D2D' }}>
                      ${farm.revenue.toFixed(2)}
                    </p>
                    <Link href="/admin/dashboard/sellers" className="text-xs font-semibold hover:underline shrink-0" style={{ color: '#053D2D' }}>
                      View Store
                    </Link>
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
