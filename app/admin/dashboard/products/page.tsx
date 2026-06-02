"use client";

import { useState, useEffect, useRef } from "react";
import { getValidAdminSession } from "@/lib/sessionHelper";
import AdminLayout from "@/components/admin/AdminLayout";

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs';

const getHeaders = (token: string) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export default function AdminProductsPage() {
  const sessRef = useRef<any>(null);

  const [products, setProducts]       = useState<any[]>([]);
  const [categories, setCategories]   = useState<any[]>([]);
  const [sellers, setSellers]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeller, setFilterSeller]     = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [stats, setStats] = useState({ active: 0, pending: 0, removed: 0 });

  const fetchData = async (sess: any) => {
    try {
      const [productsRes, categoriesRes, sellersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/categories?select=id,name,slug&order=name.asc`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name&status=eq.approved&order=farm_name.asc`,
          { headers: getHeaders(sess.access_token) }),
      ]);

      const [productsData, categoriesData, sellersData] = await Promise.all([
        productsRes.json(), categoriesRes.json(), sellersRes.json(),
      ]);

      const productsArr   = Array.isArray(productsData)   ? productsData   : [];
      const sellersArr    = Array.isArray(sellersData)     ? sellersData    : [];
      const categoriesArr = Array.isArray(categoriesData) ? categoriesData : [];

      const sellersMap: any = {};
      sellersArr.forEach((s: any) => { sellersMap[s.id] = s.farm_name; });

      const productsWithSellers = productsArr.map((p: any) => ({
        ...p,
        farm_name: sellersMap[p.seller_id] || 'Unknown Farm',
      }));

      setProducts(productsWithSellers);
      setCategories(categoriesArr);
      setSellers(sellersArr);

      setStats({
        active:  productsArr.filter((p: any) => p.status === 'active').length,
        pending: productsArr.filter((p: any) => p.status === 'draft' || p.status === 'pending').length,
        removed: productsArr.filter((p: any) => p.status === 'removed' || p.status === 'inactive').length,
      });
    } catch (err) {
      console.error('Products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getValidAdminSession();
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) { window.location.href = '/admin/login'; return; }
    const sess = JSON.parse(sessionStr);
    sessRef.current = sess;
    fetchData(sess);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch   = !search         || p.name?.toLowerCase().includes(search.toLowerCase()) || p.farm_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.category_id === filterCategory;
    const matchSeller   = !filterSeller   || p.seller_id === filterSeller;
    const matchStatus   = !filterStatus   || p.status === filterStatus;
    return matchSearch && matchCategory && matchSeller && matchStatus;
  });

  const selectCls = "border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition appearance-none bg-white";

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
        <h1 className="text-xl font-bold text-gray-900">Manage Products</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active',         value: stats.active,  color: 'text-green-700'  },
            { label: 'Pending Review', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Removed',        value: stats.removed, color: 'text-red-600'    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            {/* Status filter buttons */}
            <div className="flex gap-1 flex-wrap">
              {[
                { label: 'All',      value: ''        },
                { label: 'Active',   value: 'active'  },
                { label: 'Draft',    value: 'draft'   },
                { label: 'Removed',  value: 'removed' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    filterStatus === s.value
                      ? 'text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  style={filterStatus === s.value ? { backgroundColor: '#053D2D' } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Category filter */}
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectCls}>
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Farm filter */}
              <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)} className={selectCls}>
                <option value="">All Farms</option>
                {sellers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.farm_name}</option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition w-44"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Products list */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-2xl mb-2">📦</p>
              <p className="font-medium">{search || filterCategory || filterSeller || filterStatus ? 'No products match your filters' : 'No products yet'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Image', 'Product', 'Farm', 'Price', 'Stock', 'Status', 'Added', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap max-w-[180px] truncate">
                        {product.name}
                      </td>

                      {/* Farm */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{product.farm_name}</td>

                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                        {product.pricing_type === 'per_pound'
                          ? `$${product.price_per_pound ?? '—'}/lb`
                          : `$${product.price ?? '—'}`}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 text-gray-700">
                        {product.stock_quantity ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active'   ? 'bg-green-100 text-green-700'   :
                          product.status === 'draft' ||
                          product.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {product.status}
                        </span>
                      </td>

                      {/* Added */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`/product/${product.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            View
                          </a>
                          {product.status !== 'removed' && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Remove "${product.name}"?`)) return;
                                const sess = sessRef.current;
                                if (!sess) return;
                                await fetch(
                                  `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`,
                                  {
                                    method: 'PATCH',
                                    headers: getHeaders(sess.access_token),
                                    body: JSON.stringify({ status: 'removed' }),
                                  }
                                );
                                setProducts(prev => prev.map(p =>
                                  p.id === product.id ? { ...p, status: 'removed' } : p
                                ));
                                setStats(prev => ({
                                  ...prev,
                                  active: product.status === 'active' ? prev.active - 1 : prev.active,
                                  removed: prev.removed + 1,
                                }));
                              }}
                              className="text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
