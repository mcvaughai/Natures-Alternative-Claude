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

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition";

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-[#053D2D] hover:bg-[#0a5c43] text-white disabled:opacity-60"
    >
      {saving ? 'Saving…' : 'Save'}
    </button>
  );
}

export default function AdminSettingsPage() {
  const sessRef = useRef<any>(null);
  const [settings, setSettings] = useState({
    platform_name: '',
    tagline: '',
    contact_email: '',
    support_email: '',
    free_product_limit: '20',
    terms_text: '',
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadSettings = async (sess: any) => {
    try {
      const data = await fetchSettings(sess.access_token);
      setSettings({
        platform_name:      data.platform_name      || 'Natures Alternative Market Place',
        tagline:            data.tagline            || 'Farm-fresh produce, delivered with care.',
        contact_email:      data.contact_email      || '',
        support_email:      data.support_email      || '',
        free_product_limit: String(data.free_product_limit || '20'),
        terms_text:         data.terms_text         || '',
        maintenance_mode:   data.maintenance_mode === 'true' || data.maintenance_mode === true,
      });
      setLastUpdated(data.updated_at || null);
    } catch (err) {
      console.error('Settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveAllSettings = async () => {
    const sess = sessRef.current;
    if (!sess) return;
    setSaving(true);
    try {
      await Promise.all([
        saveSetting(sess.access_token, 'platform_name',       settings.platform_name),
        saveSetting(sess.access_token, 'tagline',             settings.tagline),
        saveSetting(sess.access_token, 'contact_email',       settings.contact_email),
        saveSetting(sess.access_token, 'support_email',       settings.support_email),
        saveSetting(sess.access_token, 'free_product_limit',  settings.free_product_limit),
        saveSetting(sess.access_token, 'terms_text',          settings.terms_text),
        saveSetting(sess.access_token, 'maintenance_mode',    settings.maintenance_mode),
      ]);
      setLastUpdated(new Date().toISOString());
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getValidAdminSession();
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) { window.location.href = '/admin/login'; return; }
    const sess = JSON.parse(sessionStr);
    sessRef.current = sess;
    loadSettings(sess);
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
      <div className="space-y-5 max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">General Settings</h2>
            <SaveButton saving={saving} onClick={saveAllSettings} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Name</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={e => setSettings(p => ({ ...p, platform_name: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings(p => ({ ...p, tagline: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={e => setSettings(p => ({ ...p, contact_email: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={e => setSettings(p => ({ ...p, support_email: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Membership Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Membership Tiers</h2>
            <SaveButton saving={saving} onClick={saveAllSettings} />
          </div>

          {/* Free tier */}
          <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: '#053D2D33' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Starter (Free)</p>
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Max Products per Seller</label>
              <input
                type="number"
                value={settings.free_product_limit}
                onChange={e => setSettings(p => ({ ...p, free_product_limit: e.target.value }))}
                min="1" max="100"
                className="w-32 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition"
              />
            </div>
          </div>

          {/* Pro tier */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 opacity-70">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Pro ($19/mo)</p>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
            <p className="text-xs text-gray-500">Unlimited products, advanced analytics, priority support, featured listings.</p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Terms &amp; Conditions</h2>
            <SaveButton saving={saving} onClick={saveAllSettings} />
          </div>
          <textarea
            rows={10}
            value={settings.terms_text}
            onChange={e => setSettings(p => ({ ...p, terms_text: e.target.value }))}
            className={inputCls + ' resize-none font-mono text-xs leading-relaxed'}
          />
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">Maintenance Mode</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Enable Maintenance Mode</p>
              <p className="text-xs text-gray-500 mt-0.5 max-w-sm">
                Enabling this will take the marketplace offline for customers. Only admins will be able to access the platform.
              </p>
            </div>
            <button
              onClick={() => {
                setSettings(p => ({ ...p, maintenance_mode: !p.maintenance_mode }));
              }}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {settings.maintenance_mode && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Maintenance mode is ON. Remember to save to persist this change.
            </div>
          )}
          <SaveButton saving={saving} onClick={saveAllSettings} />
        </div>
      </div>
    </AdminLayout>
  );
}
