"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white"}`}>
      {saved ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          Saved!
        </>
      ) : "Save"}
    </button>
  );
}

export default function AdminSettingsPage() {
  // General settings
  const [platformName, setPlatformName]     = useState("Natures Alternative Market Place");
  const [tagline, setTagline]               = useState("Farm-fresh produce, delivered with care.");
  const [contactEmail, setContactEmail]     = useState("contact@naturesalternative.com");
  const [supportEmail, setSupportEmail]     = useState("support@naturesalternative.com");
  const [savedGeneral, setSavedGeneral]     = useState(false);

  // Membership
  const [freeLimit, setFreeLimit]           = useState("20");
  const [proEnabled, setProEnabled]         = useState(false);
  const [savedMembership, setSavedMembership] = useState(false);

  // Terms
  const [terms, setTerms] = useState(`Welcome to Natures Alternative Market Place. By using our platform, you agree to the following terms and conditions.

1. Sellers must provide accurate product descriptions and pricing.
2. All products must meet our natural and sustainable farming standards.
3. Buyers are responsible for reviewing product details before purchase.
4. Natures Alternative reserves the right to remove listings that violate our policies.
5. Payment processing is handled securely through our payment partners.
6. Sellers receive payouts within 7 business days after order completion.
7. Disputes should be directed to our support team within 30 days of purchase.`);
  const [savedTerms, setSavedTerms]         = useState(false);

  // Maintenance
  const [maintenance, setMaintenance]       = useState(false);

  const save = (setter: (v: boolean) => void) => { setter(true); setTimeout(() => setter(false), 2000); };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>

        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">General Settings</h2>
            <SaveButton saved={savedGeneral} onClick={() => save(setSavedGeneral)}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Name</label>
            <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} className={inputCls}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Tagline</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputCls}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
              <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className={inputCls}/>
            </div>
          </div>
        </div>

        {/* Membership Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Membership Tiers</h2>
            <SaveButton saved={savedMembership} onClick={() => save(setSavedMembership)}/>
          </div>

          {/* Free tier */}
          <div className="border border-[#1a4a2e]/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Starter (Free)</p>
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Max Products per Seller</label>
              <input type="number" value={freeLimit} onChange={e => setFreeLimit(e.target.value)} min="1" max="100"
                className="w-32 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"/>
            </div>
          </div>

          {/* Pro tier */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 opacity-70">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Pro ($19/mo)</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Coming Soon</span>
                <button onClick={() => setProEnabled(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${proEnabled ? "bg-[#1a4a2e]" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${proEnabled ? "translate-x-5" : "translate-x-0"}`}/>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Unlimited products, advanced analytics, priority support, featured listings.</p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Terms &amp; Conditions</h2>
            <SaveButton saved={savedTerms} onClick={() => save(setSavedTerms)}/>
          </div>
          <textarea rows={10} value={terms} onChange={e => setTerms(e.target.value)}
            className={inputCls + " resize-none font-mono text-xs leading-relaxed"}/>
          <p className="text-xs text-gray-400">Last updated: December 12, 2024</p>
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
            <button onClick={() => setMaintenance(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${maintenance ? "bg-red-500" : "bg-gray-300"}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenance ? "translate-x-5" : "translate-x-0"}`}/>
            </button>
          </div>
          {maintenance && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Maintenance mode is ON. The marketplace is currently offline for customers.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
