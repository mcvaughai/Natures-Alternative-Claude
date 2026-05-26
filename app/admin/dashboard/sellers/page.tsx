"use client";

import { useState, useEffect, useCallback } from "react";
import { getValidAdminSession, getAuthHeaders } from "@/lib/sessionHelper";
import AdminLayout from "@/components/admin/AdminLayout";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";

type SellerStatus = "Active" | "Suspended";

interface Seller {
  id: string;
  store: string;
  owner: string;
  location: string;
  slug: string;
  joined: string;
  status: SellerStatus;
  email: string;
  phone: string;
  raw_status: string;
}

const STATUS_STYLES: Record<SellerStatus, string> = {
  Active:    "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-600",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Seller {
  const rawStatus = (row.status ?? "active").toLowerCase();
  const status: SellerStatus = rawStatus === "suspended" ? "Suspended" : "Active";
  return {
    id:         row.id,
    store:      row.farm_name ?? "",
    owner:      row.owner_name ?? "",
    location:   [row.city, row.state].filter(Boolean).join(", "),
    slug:       row.slug ?? "",
    joined:     row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    status,
    raw_status: rawStatus,
    email:      row.email ?? "",
    phone:      row.phone ?? "",
  };
}

export default function SellersPage() {
  const [sellers, setSellers]       = useState<Seller[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SellerStatus>("All");
  const [selected, setSelected]     = useState<Seller | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const session = await getValidAdminSession();
      if (!session) { window.location.href = "/admin/login"; return; }
      const headers = getAuthHeaders(session.access_token);

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?select=*&order=created_at.desc`,
        { headers }
      );
      if (!res.ok) { setFetchError(`Error ${res.status}`); return; }
      const data = await res.json();
      setSellers(Array.isArray(data) ? data.map(mapRow) : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const handleToggleSuspend = async (seller: Seller) => {
    setActionLoading(true);
    setSuccessMessage("");
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const headers = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };
      const newStatus = seller.status === "Active" ? "suspended" : "active";

      await fetch(`${SUPABASE_URL}/rest/v1/sellers?id=eq.${seller.id}`,
        { method: "PATCH", headers, body: JSON.stringify({ status: newStatus }) });

      setSuccessMessage(`${seller.store} has been ${newStatus === "suspended" ? "suspended" : "reactivated"}.`);
      await fetchSellers();
      setSelected(null);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = sellers.filter(s => {
    const matchSearch = !search
      || s.store.toLowerCase().includes(search.toLowerCase())
      || s.owner.toLowerCase().includes(search.toLowerCase())
      || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    Active:    sellers.filter(s => s.status === "Active").length,
    Suspended: sellers.filter(s => s.status === "Suspended").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Manage Sellers</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active",    value: counts.Active,    color: "text-green-700" },
            { label: "Suspended", value: counts.Suspended, color: "text-red-600"   },
            { label: "Total",     value: sellers.length,   color: "text-gray-900"  },
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
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {successMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            <div className="flex gap-1">
              {(["All", "Active", "Suspended"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${statusFilter === s ? "bg-[#1a4a2e] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <input type="search" placeholder="Search sellers..." value={search} onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition w-52"/>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/>
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              {sellers.length === 0 ? "No sellers yet" : "No sellers match your search"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Farm Name", "Owner", "Location", "Email", "Joined", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{s.store}</td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{s.owner}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{s.location || "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500">{s.email}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{s.joined}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button onClick={() => setSelected(selected?.id === s.id ? null : s)}
                            className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-2.5 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors whitespace-nowrap">
                            {selected?.id === s.id ? "Close" : "View"}
                          </button>
                          {s.slug && (
                            <a href={`/store/${s.slug}`} target="_blank" rel="noreferrer"
                              className="text-xs font-semibold text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                              Store
                            </a>
                          )}
                          <button
                            onClick={() => handleToggleSuspend(s)}
                            disabled={actionLoading}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${s.status === "Active" ? "text-red-500 border border-red-200 hover:bg-red-50" : "text-green-600 border border-green-200 hover:bg-green-50"}`}>
                            {s.status === "Active" ? "Suspend" : "Reactivate"}
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
                <h2 className="text-base font-bold text-gray-900">{selected.store}</h2>
                {selected.slug && <p className="text-xs text-gray-400 font-mono mt-0.5">/store/{selected.slug}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Farm Name</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.store}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Owner</p>
                  <p className="text-sm text-gray-700">{selected.owner || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{selected.location || "—"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Email</p>
                  <p className="text-sm text-gray-700">{selected.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Phone</p>
                  <p className="text-sm text-gray-700">{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Joined</p>
                  <p className="text-sm text-gray-700">{selected.joined}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {selected.slug && (
                <a href={`/store/${selected.slug}`} target="_blank" rel="noreferrer"
                  className="text-sm font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-4 py-2 rounded-xl hover:bg-[#1a4a2e]/5 transition-colors">
                  View Store Page
                </a>
              )}
              <button
                onClick={() => handleToggleSuspend(selected)}
                disabled={actionLoading}
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${selected.status === "Active" ? "text-red-500 border border-red-200 hover:bg-red-50" : "text-green-600 border border-green-200 hover:bg-green-50"}`}>
                {actionLoading ? "Processing..." : selected.status === "Active" ? "Suspend Seller" : "Reactivate Seller"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
