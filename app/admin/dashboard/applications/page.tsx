"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

type AppStatus = "Pending" | "Approved" | "Rejected";
const FILTER_TABS: AppStatus[] = ["Pending", "Approved", "Rejected"];

interface Application {
  id: string;
  reference_number: string;
  farm: string;
  owner: string;
  location: string;
  city: string;
  state: string;
  products: string;
  date: string;
  status: AppStatus;
  email: string;
  phone: string;
  fulfillment: string[];
  description: string;
  farming_practices: string;
  unique_description: string;
  applicant_user_id: string | null;
}

const STATUS_STYLES: Record<AppStatus, string> = {
  Pending:  "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

function capitalizeStatus(s: string): AppStatus {
  const map: Record<string, AppStatus> = {
    pending: "Pending", approved: "Approved", rejected: "Rejected",
  };
  return map[s] ?? "Pending";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Application {
  return {
    id:               row.id,
    reference_number: row.reference_number ?? row.id?.slice(0, 8).toUpperCase(),
    farm:             row.farm_name ?? "",
    owner:            row.owner_name ?? "",
    location:         [row.city, row.state].filter(Boolean).join(", "),
    city:             row.city ?? "",
    state:            row.state ?? "",
    products:         Array.isArray(row.product_types) ? row.product_types.join(", ") : "",
    date:             row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    status:           capitalizeStatus(row.status ?? "pending"),
    email:            row.email ?? "",
    phone:            row.phone ?? "",
    fulfillment:      Array.isArray(row.fulfillment_methods) ? row.fulfillment_methods : [],
    description:      row.farming_practices ?? row.unique_description ?? row.description ?? "",
    farming_practices: row.farming_practices ?? "",
    unique_description: row.unique_description ?? "",
    applicant_user_id: row.applicant_user_id ?? null,
  };
}

export default function ApplicationsPage() {
  const [apps, setApps]           = useState<Application[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [tab, setTab]             = useState<"All" | AppStatus>("All");
  const [selected, setSelected]   = useState<Application | null>(null);
  const [note, setNote]           = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    const { data, error } = await supabase
      .from("seller_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setFetchError(error.message);
    } else {
      setApps((data ?? []).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (app: Application) => {
    setActionLoading(true);
    setSuccessMessage("");

    // 1. Mark application approved
    const { error: appError } = await supabase
      .from("seller_applications")
      .update({ status: "approved" })
      .eq("id", app.id);

    if (appError) { setActionLoading(false); return; }

    // NOTE: Applications approved before this flow was added (e.g. Blessings Ranch)
    // will have applicant_user_id = null — their profiles/sellers records must be
    // created manually in the Supabase dashboard.
    if (app.applicant_user_id) {
      // 2. Promote user role to seller
      await supabase
        .from("profiles")
        .update({ role: "seller" })
        .eq("id", app.applicant_user_id);

      // 3. Create sellers record
      const baseSlug = app.farm.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      await supabase.from("sellers").insert({
        user_id:    app.applicant_user_id,
        farm_name:  app.farm,
        owner_name: app.owner,
        slug,
        status:     "approved",
        city:       app.city || null,
        state:      app.state || null,
        email:      app.email,
        phone:      app.phone || null,
      });
    }

    setActionLoading(false);
    setSuccessMessage("Seller approved! Their account is now active.");
    await fetchApplications();
    setSelected(null);
  };

  const handleReject = async (app: Application) => {
    setActionLoading(true);
    setSuccessMessage("");

    await supabase
      .from("seller_applications")
      .update({ status: "rejected" })
      .eq("id", app.id);

    // Application status is checked on login; no profile update needed for rejections.

    setActionLoading(false);
    await fetchApplications();
    setSelected(null);
  };

  const filtered = tab === "All" ? apps : apps.filter(a => a.status === tab);
  const counts = {
    All:      apps.length,
    Pending:  apps.filter(a => a.status === "Pending").length,
    Approved: apps.filter(a => a.status === "Approved").length,
    Rejected: apps.filter(a => a.status === "Rejected").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Seller Applications</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",    value: counts.All,      color: "text-gray-900"   },
            { label: "Pending",  value: counts.Pending,  color: "text-yellow-600" },
            { label: "Approved", value: counts.Approved, color: "text-green-700"  },
            { label: "Rejected", value: counts.Rejected, color: "text-red-600"    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Error state */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            Failed to load applications: {fetchError}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {successMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {(["All", ...FILTER_TABS] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-[#1a4a2e] text-[#1a4a2e]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {t} {t !== "All" && <span className="ml-1 text-xs">({counts[t]})</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No {tab === "All" ? "" : tab.toLowerCase()} applications yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Ref #", "Farm Name","Owner","Location","Products","Applied","Status","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono text-gray-400">{a.reference_number}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{a.farm}</td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{a.owner}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{a.location}</td>
                      <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">{a.products}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{a.date}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {a.status === "Pending" && (
                            <button onClick={() => { setSelected(selected?.id === a.id ? null : a); setNote(""); }}
                              className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                              Review
                            </button>
                          )}
                          {a.status === "Approved" && (
                            <span className="text-xs font-semibold text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">Approved</span>
                          )}
                          {a.status === "Rejected" && (
                            <button onClick={() => { setSelected(selected?.id === a.id ? null : a); setNote(""); }}
                              className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                              View
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

        {/* Review panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Application Review — {selected.farm}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selected.reference_number}</p>
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
                  <p className="text-sm font-semibold text-gray-800">{selected.farm}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Owner</p>
                  <p className="text-sm text-gray-700">{selected.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{selected.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Contact</p>
                  <p className="text-sm text-gray-700">{selected.email}</p>
                  <p className="text-sm text-gray-700">{selected.phone}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Products</p>
                  <p className="text-sm text-gray-700">{selected.products}</p>
                </div>
                {selected.fulfillment.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Fulfillment Methods</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.fulfillment.map(f => (
                        <span key={f} className="text-xs bg-[#1a4a2e]/10 text-[#1a4a2e] px-2 py-0.5 rounded-full font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.farming_practices && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Farming Practices</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.farming_practices}</p>
                  </div>
                )}
                {selected.unique_description && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">What Makes Them Unique</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.unique_description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Admin Notes</label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add internal notes about this application..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition resize-none"/>
            </div>

            {selected.status === "Pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selected)}
                  disabled={actionLoading}
                  className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  {actionLoading ? "Processing..." : "Approve Application"}
                </button>
                <button
                  onClick={() => handleReject(selected)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  {actionLoading ? "Processing..." : "Reject Application"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
