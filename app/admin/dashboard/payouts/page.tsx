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

const fetchSettings = async (token: string) => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/platform_settings?select=key,value`,
    { headers: getHeaders(token) }
  );
  const data = await res.json();
  const settings: any = {};
  if (Array.isArray(data)) {
    data.forEach((row: any) => {
      const val = row.value;
      settings[row.key] = typeof val === 'string' ? val :
        typeof val === 'object' ? val : String(val);
    });
  }
  return settings;
};

const saveSetting = async (token: string, key: string, value: any) => {
  await fetch(
    `${SUPABASE_URL}/rest/v1/platform_settings?key=eq.${key}`,
    {
      method: 'PATCH',
      headers: { ...getHeaders(token), 'Prefer': 'return=representation' },
      body: JSON.stringify({ value, updated_at: new Date().toISOString() }),
    }
  );
};

export default function PayoutsPage() {
  const sessRef = useRef<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [platformFee, setPlatformFee] = useState('8.00');
  const [savingFee, setSavingFee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingAmount: 0,
    platformRevenue: 0,
  });

  const fetchData = async (sess: any) => {
    try {
      const [payoutsRes, settingsData] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/payouts?select=*,sellers(farm_name)&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }
        ),
        fetchSettings(sess.access_token),
      ]);

      const payoutsData = await payoutsRes.json();
      const payoutsArr = Array.isArray(payoutsData) ? payoutsData : [];
      setPayouts(payoutsArr);

      if (settingsData.platform_fee_percent) {
        setPlatformFee(String(settingsData.platform_fee_percent));
      }

      const totalPaid = payoutsArr
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + (p.net_amount || 0), 0);
      const pendingAmount = payoutsArr
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + (p.net_amount || 0), 0);
      const platformRevenue = payoutsArr
        .reduce((sum: number, p: any) => sum + (p.platform_fee || 0), 0);

      setStats({ totalPaid, pendingAmount, platformRevenue });
    } catch (err) {
      console.error('Payouts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePlatformFee = async () => {
    if (!sessRef.current) return;
    setSavingFee(true);
    try {
      await saveSetting(sessRef.current.access_token, 'platform_fee_percent', parseFloat(platformFee));
      setSuccessMessage('Platform fee saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingFee(false);
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
      <div className="space-y-5 max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900">Payouts Management</h1>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Paid Out',          value: `$${stats.totalPaid.toFixed(2)}`,       color: 'text-green-700'  },
            { label: 'Pending Payouts',          value: `$${stats.pendingAmount.toFixed(2)}`,   color: 'text-yellow-600' },
            { label: 'Platform Revenue (Fees)',  value: `$${stats.platformRevenue.toFixed(2)}`, color: 'text-[#053D2D]'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Payouts table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Payout History</h2>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💰</div>
              <p className="text-gray-500 font-medium">No payouts yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Payouts will appear here when orders are completed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Farm Name', 'Period', 'Gross', 'Platform Fee', 'Net Payout', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payouts.map((payout: any) => (
                    <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                        {payout.sellers?.farm_name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {payout.period_start ? new Date(payout.period_start).toLocaleDateString() : '—'}
                        {payout.period_end ? ` — ${new Date(payout.period_end).toLocaleDateString()}` : ''}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">
                        ${payout.gross_amount?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="px-4 py-3.5 text-red-500 tabular-nums">
                        -${payout.platform_fee?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="px-4 py-3.5 font-bold tabular-nums" style={{ color: '#053D2D' }}>
                        ${payout.net_amount?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.status === 'paid'       ? 'bg-green-100 text-green-700' :
                          payout.status === 'pending'    ? 'bg-yellow-100 text-yellow-700' :
                          payout.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fee settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Fee Structure</h2>
          <div className="max-w-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Transaction Fee (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={platformFee}
                  onChange={e => setPlatformFee(e.target.value)}
                  min="0" max="100" step="0.5"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
            </div>
            <button
              onClick={savePlatformFee}
              disabled={savingFee}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-[#053D2D] hover:bg-[#0a5c43] text-white disabled:opacity-60"
            >
              {savingFee ? 'Saving…' : 'Save Fee Settings'}
            </button>
            <p className="text-xs text-gray-400">Changes apply to all future transactions. Current sellers will be notified of any fee changes.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
