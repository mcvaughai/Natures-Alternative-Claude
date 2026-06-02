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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
    active: 0,
  });

  const fetchCustomers = async (sess: any) => {
    try {
      const [profilesRes, ordersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?role=eq.customer&select=*&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }),
        fetch(`${SUPABASE_URL}/rest/v1/orders?select=user_id,total_amount,status`,
          { headers: getHeaders(sess.access_token) }),
      ]);

      const profilesData = await profilesRes.json();
      const ordersData = await ordersRes.json();

      const profiles = Array.isArray(profilesData) ? profilesData : [];
      const orders = Array.isArray(ordersData) ? ordersData : [];

      const ordersPerCustomer: any = {};
      orders.forEach((o: any) => {
        if (!ordersPerCustomer[o.user_id]) {
          ordersPerCustomer[o.user_id] = { count: 0, total: 0 };
        }
        ordersPerCustomer[o.user_id].count++;
        ordersPerCustomer[o.user_id].total += o.total_amount || 0;
      });

      const customersWithOrders = profiles.map((p: any) => ({
        ...p,
        orderCount: ordersPerCustomer[p.id]?.count || 0,
        totalSpent: ordersPerCustomer[p.id]?.total || 0,
        displayName: p.first_name && p.last_name
          ? `${p.first_name} ${p.last_name}`
          : p.email || 'Unknown',
      }));

      setCustomers(customersWithOrders);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // All returned profiles are customers (role=eq.customer filter applied)
      setStats({
        total:        profiles.length,
        newThisMonth: profiles.filter((p: any) => new Date(p.created_at) >= startOfMonth).length,
        active:       profiles.length, // all fetched are role=customer
      });
    } catch (err) {
      console.error('Customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getValidAdminSession();
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) { window.location.href = '/admin/login'; return; }
    const sess = JSON.parse(sessionStr);
    fetchCustomers(sess);
  }, []);

  const filteredCustomers = customers.filter(c =>
    !search ||
    c.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-xl font-bold text-gray-900">Manage Customers</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Customers',  value: stats.total,        color: 'text-gray-900'  },
            { label: 'Active',           value: stats.active,       color: 'text-green-700' },
            { label: 'New This Month',   value: stats.newThisMonth, color: 'text-[#053D2D]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative ml-auto">
              <input
                type="search"
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-2xl mb-2">👥</p>
              <p className="font-medium">{search ? 'No customers match your search' : 'No customers yet'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Name', 'Email', 'Joined', 'Orders', 'Total Spent', 'Role', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((customer: any) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: '#053D2D' }}>
                            {customer.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-gray-800 whitespace-nowrap">{customer.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{customer.email}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{customer.orderCount}</td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums" style={{ color: '#053D2D' }}>
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.role === 'admin'    ? 'bg-purple-100 text-purple-700' :
                          customer.role === 'seller'   ? 'bg-blue-100 text-blue-700' :
                          customer.role === 'suspended'? 'bg-red-100 text-red-600' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {customer.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button className="text-xs font-semibold border px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                          style={{ borderColor: '#053D2D', color: '#053D2D' }}>
                          View
                        </button>
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
