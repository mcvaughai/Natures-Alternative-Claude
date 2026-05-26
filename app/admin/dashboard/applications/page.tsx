"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const SUPABASE_URL  = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

type AppStatus = "pending" | "approved" | "rejected";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Application = Record<string, any>;

const STATUS_STYLES: Record<AppStatus, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function makeSlug(name: string): string {
  return (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + `-${Date.now().toString(36)}`;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [tab, setTab]                   = useState<"all" | AppStatus>("all");
  const [selected, setSelected]         = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ── Session ───────────────────────────────────────────────────────────────
  const getSession = useCallback(() => {
    try {
      const s = localStorage.getItem("admin_session");
      if (!s) { window.location.href = "/admin/login"; return null; }
      return JSON.parse(s);
    } catch {
      window.location.href = "/admin/login";
      return null;
    }
  }, []);

  const authHeaders = useCallback((accessToken: string) => ({
    "apikey":        SUPABASE_KEY,
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type":  "application/json",
  }), []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    const sess = getSession();
    if (!sess) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/seller_applications?select=*&order=created_at.desc`,
        { headers: authHeaders(sess.access_token) }
      );
      if (!res.ok) { setFetchError(`Error ${res.status}`); return; }
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [getSession, authHeaders]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const approveApplication = async (app: Application) => {
    setActionLoading(true);
    setSuccessMessage("");
    const sess = getSession();
    if (!sess) return;
    const headers = { ...authHeaders(sess.access_token), Prefer: "return=representation" };
    try {
      // 1. Mark application approved
      await fetch(`${SUPABASE_URL}/rest/v1/seller_applications?id=eq.${app.id}`, {
        method:  "PATCH",
        headers,
        body:    JSON.stringify({ status: "approved", reviewed_at: new Date().toISOString() }),
      });

      // 2. Create seller record
      await fetch(`${SUPABASE_URL}/rest/v1/sellers`, {
        method:  "POST",
        headers,
        body:    JSON.stringify({
          farm_name:   app.farm_name,
          email:       app.email,
          city:        app.city        ?? null,
          state:       app.state       ?? null,
          zip_code:    app.zip_code    ?? app.zip ?? null,
          description: app.description ?? null,
          phone:       app.phone       ?? null,
          slug:        makeSlug(app.farm_name),
          status:      "approved",
          user_id:     app.user_id     ?? null,
          fulfillment: app.fulfillment_methods ?? [],
          created_at:  new Date().toISOString(),
          updated_at:  new Date().toISOString(),
        }),
      });

      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "approved" } : a));
      setSuccessMessage(`${app.farm_name} has been approved! Their seller account is now active.`);
      setSelected(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const rejectApplication = async (app: Application) => {
    if (!confirm(`Reject application from ${app.farm_name}?`)) return;
    setActionLoading(true);
    setSuccessMessage("");
    const sess = getSession();
    if (!sess) return;
    const headers = authHeaders(sess.access_token);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/seller_applications?id=eq.${app.id}`, {
        method:  "PATCH",
        headers,
        body:    JSON.stringify({ status: "rejected", reviewed_at: new Date().toISOString() }),
      });
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "rejected" } : a));
      setSelected(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const total    = applications.length;
  const pending  = applications.filter(a => a.status === "pending").length;
  const approved = applications.filter(a => a.status === "approved").length;
  const rejected = applications.filter(a => a.status === "rejected").length;

  const filtered = tab === "all" ? applications : applications.filter(a => a.status === tab);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Seller Applications</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",    value: total,    color: "text-gray-900"   },
            { label: "Pending",  value: pending,  color: "text-yellow-600" },
            { label: "Approved", value: approved, color: "text-green-700"  },
            { label: "Rejected", value: rejected, color: "text-red-600"    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Error / Success */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {fetchError}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {successMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filter tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {(["all", "pending", "approved", "rejected"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors capitalize ${
                  tab === t ? "border-[#1a4a2e] text-[#1a4a2e]" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}>
                {t === "all" ? `All (${total})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${t === "pending" ? pending : t === "approved" ? approved : rejected})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {total === 0 ? "No applications yet" : `No ${tab} applications`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Farm Name", "Owner", "Email", "Location", "Products", "Applied", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{a.farm_name}</td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{a.owner_name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500">{a.email}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{[a.city, a.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">
                        {Array.isArray(a.product_types) ? a.product_types.join(", ") : (a.product_types ?? "—")}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(a.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[a.status as AppStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelected(selected?.id === a.id ? null : a)}
                          className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                          {selected?.id === a.id ? "Close" : "Review"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">{selected.farm_name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Applied {formatDate(selected.created_at)}</p>
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
                  <p className="text-sm font-semibold text-gray-800">{selected.farm_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Owner</p>
                  <p className="text-sm text-gray-700">{selected.owner_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Contact</p>
                  <p className="text-sm text-gray-700">{selected.email}</p>
                  {selected.phone && <p className="text-sm text-gray-700">{selected.phone}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{[selected.city, selected.state].filter(Boolean).join(", ") || "—"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Product Types</p>
                  <p className="text-sm text-gray-700">
                    {Array.isArray(selected.product_types) ? selected.product_types.join(", ") : (selected.product_types ?? "—")}
                  </p>
                </div>
                {selected.fulfillment_methods?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Fulfillment</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.fulfillment_methods.map((f: string) => (
                        <span key={f} className="text-xs bg-[#1a4a2e]/10 text-[#1a4a2e] px-2 py-0.5 rounded-full font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.description && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[selected.status as AppStatus] ?? "bg-gray-100 text-gray-600"}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>

            {selected.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => approveApplication(selected)}
                  disabled={actionLoading}
                  className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  {actionLoading ? "Processing..." : "Approve Application"}
                </button>
                <button
                  onClick={() => rejectApplication(selected)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  {actionLoading ? "Processing..." : "Reject Application"}
                </button>
              </div>
            )}

            {selected.status === "approved" && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                ✓ This application has been approved. The seller account is active.
              </div>
            )}

            {selected.status === "rejected" && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                ✗ This application has been rejected.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
