"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getValidAdminSession } from "@/lib/sessionHelper";
import AdminLayout from "@/components/admin/AdminLayout";

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs';

const getHeaders = (token: string) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const STATUS_STYLES: Record<string, string> = {
  approved:  'bg-green-100 text-green-700',
  active:    'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-600',
};

export default function SellersPage() {
  const sessRef = useRef<any>(null);

  const [sellers, setSellers]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected]     = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0, suspended: 0,
  });

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const session = await getValidAdminSession();
      if (!session) { window.location.href = '/admin/login'; return; }
      sessRef.current = session;
      const token = session.access_token;

      const [sellersRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/sellers?select=*&order=created_at.desc`,
          { headers: getHeaders(token) }),
        fetch(`${SUPABASE_URL}/rest/v1/products?select=id,seller_id,status&status=eq.active`,
          { headers: getHeaders(token) }),
        fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,seller_id,total_amount,status`,
          { headers: getHeaders(token) }),
      ]);

      const [sellersData, productsData, ordersData] = await Promise.all([
        sellersRes.json(), productsRes.json(), ordersRes.json(),
      ]);

      const sellersArr  = Array.isArray(sellersData)  ? sellersData  : [];
      const productsArr = Array.isArray(productsData) ? productsData : [];
      const ordersArr   = Array.isArray(ordersData)   ? ordersData   : [];

      if (!sellersRes.ok) { setFetchError(`Error ${sellersRes.status}`); return; }

      // Build count maps
      const productCountMap: any = {};
      productsArr.forEach((p: any) => {
        productCountMap[p.seller_id] = (productCountMap[p.seller_id] || 0) + 1;
      });

      const orderCountMap: any = {};
      const revenueMap: any    = {};
      ordersArr.forEach((o: any) => {
        orderCountMap[o.seller_id] = (orderCountMap[o.seller_id] || 0) + 1;
        if (o.status === 'completed') {
          revenueMap[o.seller_id] = (revenueMap[o.seller_id] || 0) + (o.total_amount || 0);
        }
      });

      const enriched = sellersArr.map((s: any) => ({
        ...s,
        productCount: productCountMap[s.id] || 0,
        orderCount:   orderCountMap[s.id]   || 0,
        revenue:      revenueMap[s.id]      || 0,
      }));

      setSellers(enriched);
      setStats({
        total:     sellersArr.length,
        approved:  sellersArr.filter((s: any) => s.status === 'approved' || s.status === 'active').length,
        pending:   sellersArr.filter((s: any) => s.status === 'pending').length,
        suspended: sellersArr.filter((s: any) => s.status === 'suspended').length,
      });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const handleToggleSuspend = async (seller: any) => {
    const sess = sessRef.current;
    if (!sess) return;
    setActionLoading(true);
    setSuccessMessage('');
    try {
      const newStatus = (seller.status === 'approved' || seller.status === 'active') ? 'suspended' : 'approved';
      await fetch(`${SUPABASE_URL}/rest/v1/sellers?id=eq.${seller.id}`,
        {
          method: 'PATCH',
          headers: { ...getHeaders(sess.access_token), 'Prefer': 'return=representation' },
          body: JSON.stringify({ status: newStatus }),
        });
      setSuccessMessage(`${seller.farm_name} has been ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}.`);
      await fetchSellers();
      setSelected(null);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSellers = sellers.filter(s => {
    const matchSearch = !search
      || s.farm_name?.toLowerCase().includes(search.toLowerCase())
      || s.email?.toLowerCase().includes(search.toLowerCase())
      || s.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All'
      || (statusFilter === 'Approved' && (s.status === 'approved' || s.status === 'active'))
      || s.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const isActive = (s: any) => s.status === 'approved' || s.status === 'active';

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Manage Sellers</h1>

        {/* Stats — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sellers', value: stats.total,     color: 'text-gray-900'   },
            { label: 'Approved',      value: stats.approved,  color: 'text-green-700'  },
            { label: 'Pending',       value: stats.pending,   color: 'text-yellow-600' },
            { label: 'Suspended',     value: stats.suspended, color: 'text-red-600'    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            Failed to load sellers: {fetchError}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            <div className="flex gap-1">
              {['All', 'Approved', 'Pending', 'Suspended'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === s ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  style={statusFilter === s ? { backgroundColor: '#053D2D' } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <input
                type="search"
                placeholder="Search sellers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition w-52"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#053D2D', borderTopColor: 'transparent' }} />
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-2xl mb-2">🏪</p>
              <p className="text-sm">{sellers.length === 0 ? 'No sellers yet' : 'No sellers match your search'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Farm', 'Owner / Location', 'Products', 'Orders', 'Revenue', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSellers.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Farm name + logo */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-sm font-bold"
                            style={{ backgroundColor: '#f0fdf4', color: '#14532d' }}
                          >
                            {s.logo_url
                              ? <img src={s.logo_url} alt={s.farm_name} className="w-full h-full object-cover" />
                              : (s.farm_name?.charAt(0) || '?')}
                          </div>
                          <span className="font-semibold text-gray-800 whitespace-nowrap">{s.farm_name}</span>
                        </div>
                      </td>

                      {/* Owner / Location */}
                      <td className="px-4 py-3.5">
                        <p className="text-gray-700 text-sm">{s.owner_name || '—'}</p>
                        {(s.city || s.state) && (
                          <p className="text-xs text-gray-400">{[s.city, s.state].filter(Boolean).join(', ')}</p>
                        )}
                      </td>

                      {/* Products */}
                      <td className="px-4 py-3.5 text-gray-700 tabular-nums">{s.productCount}</td>

                      {/* Orders */}
                      <td className="px-4 py-3.5 text-gray-700 tabular-nums">{s.orderCount}</td>

                      {/* Revenue */}
                      <td className="px-4 py-3.5 font-semibold tabular-nums" style={{ color: '#053D2D' }}>
                        ${s.revenue.toFixed(2)}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelected(selected?.id === s.id ? null : s)}
                            className="text-xs font-semibold border px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                            style={{ borderColor: '#053D2D', color: '#053D2D' }}
                          >
                            {selected?.id === s.id ? 'Close' : 'View'}
                          </button>
                          {s.slug && (
                            <a
                              href={`/store/${s.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Store
                            </a>
                          )}
                          <button
                            onClick={() => handleToggleSuspend(s)}
                            disabled={actionLoading}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${
                              isActive(s)
                                ? 'text-red-500 border border-red-200 hover:bg-red-50'
                                : 'text-green-600 border border-green-200 hover:bg-green-50'
                            }`}
                          >
                            {isActive(s) ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seller detail panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">{selected.farm_name}</h2>
                {selected.slug && <p className="text-xs text-gray-400 font-mono mt-0.5">/store/{selected.slug}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Farm Name</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.farm_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Owner</p>
                  <p className="text-sm text-gray-700">{selected.owner_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{[selected.city, selected.state].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Products / Orders / Revenue</p>
                  <p className="text-sm text-gray-700">
                    {selected.productCount} products · {selected.orderCount} orders · ${selected.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Email</p>
                  <p className="text-sm text-gray-700">{selected.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Phone</p>
                  <p className="text-sm text-gray-700">{selected.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Joined</p>
                  <p className="text-sm text-gray-700">
                    {selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {selected.slug && (
                <a
                  href={`/store/${selected.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold border px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#053D2D', color: '#053D2D' }}
                >
                  View Store Page
                </a>
              )}
              <button
                onClick={() => handleToggleSuspend(selected)}
                disabled={actionLoading}
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                  isActive(selected)
                    ? 'text-red-500 border border-red-200 hover:bg-red-50'
                    : 'text-green-600 border border-green-200 hover:bg-green-50'
                }`}
              >
                {actionLoading ? 'Processing…' : isActive(selected) ? 'Suspend Seller' : 'Reactivate Seller'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
