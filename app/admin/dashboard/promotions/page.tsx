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

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition";

export default function PromotionsPage() {
  const sessRef = useRef<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [featuredFarms, setFeaturedFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDealForm, setShowDealForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [newDeal, setNewDeal] = useState({
    name: '',
    description: '',
    discount_percent: '',
    start_date: '',
    end_date: '',
  });

  const fetchData = async (sess: any) => {
    try {
      const [sellersRes, dealsRes, featuredRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/sellers?status=eq.approved&select=id,farm_name,slug&order=farm_name.asc`,
          { headers: getHeaders(sess.access_token) }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/deals?select=*&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/featured_farms?is_active=eq.true&select=*,sellers(id,farm_name,slug)&order=position.asc`,
          { headers: getHeaders(sess.access_token) }
        ),
      ]);

      const [sellersData, dealsData, featuredData] = await Promise.all([
        sellersRes.json(), dealsRes.json(), featuredRes.json(),
      ]);

      setSellers(Array.isArray(sellersData) ? sellersData : []);
      setDeals(Array.isArray(dealsData) ? dealsData : []);
      setFeaturedFarms(Array.isArray(featuredData) ? featuredData : []);
    } catch (err) {
      console.error('Promotions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDeal = async () => {
    if (!newDeal.name.trim()) { alert('Please enter a deal name'); return; }
    const sess = sessRef.current;
    if (!sess) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/deals`,
        {
          method: 'POST',
          headers: { ...getHeaders(sess.access_token), 'Prefer': 'return=representation' },
          body: JSON.stringify({
            name: newDeal.name,
            description: newDeal.description || null,
            discount_percent: parseFloat(newDeal.discount_percent) || null,
            start_date: newDeal.start_date || null,
            end_date: newDeal.end_date || null,
            is_active: true,
          }),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setDeals(prev => [saved[0], ...prev]);
        setNewDeal({ name: '', description: '', discount_percent: '', start_date: '', end_date: '' });
        setShowDealForm(false);
        setSuccessMessage('Deal created!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const deleteDeal = async (dealId: string) => {
    if (!confirm('Delete this deal?')) return;
    const sess = sessRef.current;
    if (!sess) return;
    await fetch(
      `${SUPABASE_URL}/rest/v1/deals?id=eq.${dealId}`,
      { method: 'DELETE', headers: getHeaders(sess.access_token) }
    );
    setDeals(prev => prev.filter((d: any) => d.id !== dealId));
  };

  const addFeaturedFarm = async () => {
    if (!selectedFarmId) return;
    const sess = sessRef.current;
    if (!sess) return;
    const already = featuredFarms.find((f: any) => f.seller_id === selectedFarmId);
    if (already) { alert('This farm is already featured'); return; }
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/featured_farms`,
      {
        method: 'POST',
        headers: { ...getHeaders(sess.access_token), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          seller_id: selectedFarmId,
          position: featuredFarms.length + 1,
          is_active: true,
        }),
      }
    );
    if (res.ok) {
      const saved = await res.json();
      const seller = sellers.find((s: any) => s.id === selectedFarmId);
      setFeaturedFarms(prev => [...prev, { ...saved[0], sellers: seller }]);
      setSelectedFarmId('');
      setSuccessMessage('Farm featured!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const removeFeaturedFarm = async (featuredId: string) => {
    const sess = sessRef.current;
    if (!sess) return;
    await fetch(
      `${SUPABASE_URL}/rest/v1/featured_farms?id=eq.${featuredId}`,
      { method: 'DELETE', headers: getHeaders(sess.access_token) }
    );
    setFeaturedFarms(prev => prev.filter((f: any) => f.id !== featuredId));
  };

  useEffect(() => {
    getValidAdminSession();
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) { window.location.href = '/admin/login'; return; }
    const sess = JSON.parse(sessionStr);
    sessRef.current = sess;
    fetchData(sess);
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

  // Sellers not already featured
  const availableSellers = sellers.filter(
    (s: any) => !featuredFarms.find((f: any) => f.seller_id === s.id)
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <h1 className="text-xl font-bold text-gray-900">Promotions &amp; Featured Listings</h1>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Featured Farms */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Featured Farms</h2>

          {featuredFarms.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No featured farms yet. Add one below.</p>
          ) : (
            <div className="space-y-2">
              {featuredFarms.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#053D2D' }} />
                    <span className="text-sm text-gray-800 font-medium">
                      {f.sellers?.farm_name || '—'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFeaturedFarm(f.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {availableSellers.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedFarmId}
                onChange={e => setSelectedFarmId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition appearance-none"
              >
                <option value="">Select a farm to feature...</option>
                {availableSellers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.farm_name}</option>
                ))}
              </select>
              <button
                onClick={addFeaturedFarm}
                disabled={!selectedFarmId}
                className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#053D2D' }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Special Deals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Special Deals</h2>
            <button
              onClick={() => setShowDealForm(v => !v)}
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-colors"
              style={{ backgroundColor: '#053D2D' }}
            >
              {showDealForm ? 'Cancel' : '+ New Deal'}
            </button>
          </div>

          {/* Create deal form */}
          {showDealForm && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Create New Deal</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newDeal.name}
                  onChange={e => setNewDeal(p => ({ ...p, name: e.target.value }))}
                  placeholder="Deal name"
                  className={inputCls}
                />
                <div className="relative">
                  <input
                    type="number"
                    value={newDeal.discount_percent}
                    onChange={e => setNewDeal(p => ({ ...p, discount_percent: e.target.value }))}
                    placeholder="Discount %"
                    min="1" max="100"
                    className={inputCls + ' pr-8'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newDeal.start_date}
                    onChange={e => setNewDeal(p => ({ ...p, start_date: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newDeal.end_date}
                    onChange={e => setNewDeal(p => ({ ...p, end_date: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <input
                type="text"
                value={newDeal.description}
                onChange={e => setNewDeal(p => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                className={inputCls}
              />
              <button
                onClick={saveDeal}
                className="text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                style={{ backgroundColor: '#053D2D' }}
              >
                Create Deal
              </button>
            </div>
          )}

          {/* Deals table */}
          {deals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-2">🏷️</p>
              <p className="font-medium">No deals yet</p>
              <p className="text-sm mt-1">Create your first deal above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Deal Name', 'Discount', 'Starts', 'Ends', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deals.map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                      <td className="px-4 py-3">
                        {d.discount_percent != null && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {d.discount_percent}% off
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {d.start_date ? new Date(d.start_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {d.end_date ? new Date(d.end_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteDeal(d.id)}
                          className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
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
