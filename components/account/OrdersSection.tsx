"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const getHeaders = (token: string) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled" | "ready_for_pickup";

const STATUS_STYLES: Record<string, string> = {
  confirmed:       "bg-green-100 text-green-700",
  pending:         "bg-yellow-100 text-yellow-700",
  completed:       "bg-gray-100 text-gray-600",
  cancelled:       "bg-red-100 text-red-600",
  ready_for_pickup:"bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed:        "Confirmed",
  pending:          "Pending",
  completed:        "Completed",
  cancelled:        "Cancelled",
  ready_for_pickup: "Ready for Pickup",
};

const FILTER_TABS = ["All Orders", "pending", "confirmed", "completed", "cancelled"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrdersSection() {
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [session, setSession]   = useState<any>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("All Orders");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (!sessionStr) { setLoading(false); return; }
    const sess = JSON.parse(sessionStr);
    setSession(sess);
    fetchOrders(sess);
  }, []);

  async function fetchOrders(sess: any) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${sess.user_id}&select=*&order=created_at.desc`,
        { headers: getHeaders(sess.access_token) }
      );
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders.filter((o) => {
    const matchTab    = activeTab === "All Orders" || o.status === activeTab;
    const matchSearch =
      search === "" ||
      (o.order_number ?? o.id).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#1a4a2e] text-[#1a4a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "All Orders" ? "All Orders" : (STATUS_LABELS[tab] ?? tab)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <input
              type="search"
              placeholder="Search by order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
          </div>
        ) : !session ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">Please <Link href="/login" className="text-[#1a4a2e] font-semibold underline">log in</Link> to view your orders.</p>
          </div>
        ) : filtered.length === 0 && orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-raleway font-bold text-gray-700 text-xl mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">When you place orders they will appear here</p>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: "#053D2D" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No orders match your filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Order #", "Date", "Total", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                      #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">
                      ${Number(order.total_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Only show pagination if there are more than 10 orders */}
      {orders.length > 10 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}
