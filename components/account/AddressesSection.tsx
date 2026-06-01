"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const getHeaders = (token: string) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

const BLANK_FORM = {
  label: "Home",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  is_default: false,
};

function AddressCard({
  address,
  onSetDefault,
  onDelete,
}: {
  address: any;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 ${address.is_default ? "border-[#1a4a2e]/30" : "border-gray-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">{address.label}</span>
          {address.is_default && (
            <span className="px-2 py-0.5 bg-[#1a4a2e] text-white text-[10px] font-bold rounded-full">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-0.5 mb-4">
        <p className="font-medium text-gray-800">{address.name}</p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>{address.city}, {address.state} {address.zip}</p>
        <p>{address.country === "US" ? "United States" : address.country}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onDelete(address.id)}
          className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Set as Default
          </button>
        )}
      </div>
    </div>
  );
}

export default function AddressesSection() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [session, setSession]     = useState<any>(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formData, setFormData]   = useState(BLANK_FORM);

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (!sessionStr) { setLoading(false); return; }
    const sess = JSON.parse(sessionStr);
    setSession(sess);
    fetchAddresses(sess);
  }, []);

  async function fetchAddresses(sess: any) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/addresses?user_id=eq.${sess.user_id}&select=*&order=is_default.desc,created_at.asc`,
        { headers: getHeaders(sess.access_token) }
      );
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveAddress() {
    if (!formData.name || !formData.line1 || !formData.city || !formData.state || !formData.zip) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/addresses`, {
        method: "POST",
        headers: { ...getHeaders(session.access_token), Prefer: "return=representation" },
        body: JSON.stringify({
          user_id:    session.user_id,
          label:      formData.label,
          name:       formData.name,
          line1:      formData.line1,
          line2:      formData.line2 || null,
          city:       formData.city,
          state:      formData.state,
          zip:        formData.zip,
          country:    formData.country,
          is_default: formData.is_default,
          created_at: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setAddresses((prev) => [...prev, saved[0]]);
        setShowForm(false);
        setFormData(BLANK_FORM);
      } else {
        const err = await res.text();
        alert("Failed to save address: " + err);
      }
    } catch (err: any) {
      alert("Error saving address: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(addressId: string) {
    if (!confirm("Delete this address?")) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/addresses?id=eq.${addressId}`, {
        method: "DELETE",
        headers: getHeaders(session.access_token),
      });
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  }

  async function setDefaultAddress(addressId: string) {
    try {
      // Remove default from all user's addresses
      await fetch(
        `${SUPABASE_URL}/rest/v1/addresses?user_id=eq.${session.user_id}`,
        {
          method: "PATCH",
          headers: getHeaders(session.access_token),
          body: JSON.stringify({ is_default: false }),
        }
      );
      // Set new default
      await fetch(
        `${SUPABASE_URL}/rest/v1/addresses?id=eq.${addressId}`,
        {
          method: "PATCH",
          headers: getHeaders(session.access_token),
          body: JSON.stringify({ is_default: true }),
        }
      );
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === addressId }))
      );
    } catch (err) {
      console.error("Error setting default:", err);
    }
  }

  function field(key: keyof typeof formData) {
    return (v: string | boolean) =>
      setFormData((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Saved Addresses</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Address
        </button>
      </div>

      {/* Add address form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Add New Address</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Label</label>
              <input
                type="text"
                placeholder='e.g. "Home", "Work"'
                value={formData.label}
                onChange={(e) => field("label")(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => field("name")(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
              <input
                type="text"
                placeholder="123 Maple Street"
                value={formData.line1}
                onChange={(e) => field("line1")(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Apartment / Suite <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Apt 4B"
                value={formData.line2}
                onChange={(e) => field("line2")(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Austin"
                  value={formData.city}
                  onChange={(e) => field("city")(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => field("state")(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none"
                  >
                    <option value="" disabled>State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
                <input
                  type="text"
                  placeholder="78701"
                  maxLength={10}
                  value={formData.zip}
                  onChange={(e) => field("zip")(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <div className="relative">
                <select
                  value={formData.country}
                  onChange={(e) => field("country")(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => field("is_default")(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is_default" className="text-sm text-gray-700">Set as default address</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveAddress}
                disabled={saving}
                className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
              <button
                onClick={() => { setShowForm(false); setFormData(BLANK_FORM); }}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">🏠</div>
          <p className="text-gray-500 font-medium">No saved addresses yet</p>
          <p className="text-gray-400 text-sm mt-1">Add an address to speed up checkout</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onSetDefault={setDefaultAddress}
              onDelete={deleteAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
