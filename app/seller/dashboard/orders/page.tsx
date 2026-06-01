"use client";

import { useState, useEffect, useCallback } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { getValidSellerSession, getAuthHeaders } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: OrderStatus;
  total_amount: number;
  fulfillment_type: string;
  fulfillment_address: string | null;
  customer_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  seller_notes: string | null;
  items: OrderItem[];
}

interface Stats {
  pending: number;
  confirmed: number;
  completed: number;
  totalRevenue: number;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  ready:     "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  ready:     "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const FILTER_TABS = ["All", "Pending", "Confirmed", "Ready", "Completed", "Cancelled"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(amount: number) {
  return "$" + (amount / 100).toFixed(2);
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, confirmed: 0, completed: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("All");
  const [selected, setSelected] = useState<Order | null>(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const getSession = () => getValidSellerSession();

  const buildHeaders = (token: string) => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const fetchOrders = useCallback(async (session: { access_token: string; seller_id: string }) => {
    try {
      const headers = buildHeaders(session.access_token);

      const ordersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?seller_id=eq.${session.seller_id}&select=*&order=created_at.desc`,
        { headers }
      );
      const rawOrders = await ordersRes.json();
      if (!Array.isArray(rawOrders) || rawOrders.length === 0) {
        setOrders([]);
        setStats({ pending: 0, confirmed: 0, completed: 0, totalRevenue: 0 });
        return;
      }

      const ordersWithItems = await Promise.all(
        rawOrders.map(async (order: Order) => {
          const itemsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=*`,
            { headers }
          );
          const items = await itemsRes.json();
          return { ...order, items: Array.isArray(items) ? items : [] };
        })
      );

      setOrders(ordersWithItems);

      setStats({
        pending:      ordersWithItems.filter(o => o.status === "pending").length,
        confirmed:    ordersWithItems.filter(o => o.status === "confirmed").length,
        completed:    ordersWithItems.filter(o => o.status === "completed").length,
        totalRevenue: ordersWithItems
          .filter(o => o.status === "completed")
          .reduce((sum, o) => sum + (o.total_amount || 0), 0),
      });
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSession().then(session => {
      if (!session) return;
      fetchOrders(session);
    });
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId + newStatus);
    try {
      const session = await getSession();
      if (!session) return;
      const headers = {
        ...buildHeaders(session.access_token),
        Prefer: "return=representation",
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }),
      });
      if (!res.ok) {
        const errText = await res.text();
        alert("Error updating order: " + errText);
        return;
      }

      // Deduct stock when order is completed
      if (newStatus === "completed") {
        const order = orders.find(o => o.id === orderId);
        if (order && order.items) {
          for (const item of order.items) {
            const productRes = await fetch(
              `${SUPABASE_URL}/rest/v1/products?id=eq.${item.product_id}&select=id,stock_quantity,pricing_type`,
              { headers: getAuthHeaders(session.access_token) }
            );
            const productData = await productRes.json();
            if (Array.isArray(productData) && productData[0]) {
              const product = productData[0];
              const currentStock = product.stock_quantity || 0;
              const newStock = Math.max(0, currentStock - (item.quantity || 1));

              await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${item.product_id}`,
                {
                  method: "PATCH",
                  headers: { ...getAuthHeaders(session.access_token), "Content-Type": "application/json" },
                  body: JSON.stringify({ stock_quantity: newStock, updated_at: new Date().toISOString() }),
                }
              );

              if (product.pricing_type === "per_pound" && item.unit_id) {
                await fetch(
                  `${SUPABASE_URL}/rest/v1/product_units?id=eq.${item.unit_id}`,
                  {
                    method: "PATCH",
                    headers: { ...getAuthHeaders(session.access_token), "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "sold" }),
                  }
                );
              }

              await fetch(
                `${SUPABASE_URL}/rest/v1/inventory_history`,
                {
                  method: "POST",
                  headers: { ...getAuthHeaders(session.access_token), "Content-Type": "application/json" },
                  body: JSON.stringify({
                    product_id:        item.product_id,
                    seller_id:         session.seller_id,
                    change_type:       "sale",
                    change_amount:     -(item.quantity || 1),
                    previous_quantity: currentStock,
                    new_quantity:      newStock,
                    notes:             `Order ${orderId} completed`,
                  }),
                }
              );
            }
          }
        }
      }

      await fetchOrders(session);
      setSelected(prev => prev?.id === orderId ? { ...prev, status: newStatus as OrderStatus } : prev);
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUpdating(null);
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    try {
      const session = await getSession();
      if (!session) return;
      const headers = {
        ...buildHeaders(session.access_token),
        Prefer: "return=representation",
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${selected.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ seller_notes: note, updated_at: new Date().toISOString() }),
      });
      if (!res.ok) {
        alert("Error saving note: " + await res.text());
        return;
      }
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, seller_notes: note } : o));
      setSelected(prev => prev ? { ...prev, seller_notes: note } : prev);
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingNote(false);
    }
  };

  const tabLower = tab.toLowerCase() as OrderStatus | "all";
  const filtered = tabLower === "all" ? orders : orders.filter(o => o.status === tabLower);

  const countFor = (t: typeof FILTER_TABS[number]) => {
    if (t === "All") return orders.length;
    return orders.filter(o => o.status === t.toLowerCase()).length;
  };

  const TIMELINE_STEPS: OrderStatus[] = ["pending", "confirmed", "ready", "completed"];

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "All Orders",    value: orders.length,        color: "text-gray-900"   },
            { label: "Pending",       value: stats.pending,        color: "text-yellow-600" },
            { label: "Confirmed",     value: stats.confirmed,      color: "text-green-700"  },
            { label: "Revenue",       value: formatCurrency(stats.totalRevenue), color: "text-[#1a4a2e]" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filter tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {FILTER_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t ? "border-[#1a4a2e] text-[#1a4a2e]" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}>
                {t}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-[#1a4a2e] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {countFor(t)}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <svg className="w-6 h-6 animate-spin text-[#1a4a2e]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p className="font-bold text-gray-700 text-base">
                {tab === "All" ? "No orders yet" : `No ${tab.toLowerCase()} orders`}
              </p>
              <p className="text-sm text-gray-400">
                {tab === "All"
                  ? "When customers place orders they will appear here."
                  : `Orders with status "${tab.toLowerCase()}" will appear here.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order #", "Date", "Items", "Total", "Fulfillment", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3.5 text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">{formatCurrency(order.total_amount)}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap capitalize">{order.fulfillment_type || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {order.status === "pending" && (
                            <button
                              disabled={!!updating}
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1a4a2e] hover:bg-[#2d6b47] text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {updating === order.id + "confirmed" ? "..." : "Confirm"}
                            </button>
                          )}
                          {order.status === "confirmed" && (
                            <button
                              disabled={!!updating}
                              onClick={() => updateOrderStatus(order.id, "ready")}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {updating === order.id + "ready" ? "..." : "Mark Ready"}
                            </button>
                          )}
                          {order.status === "ready" && (
                            <button
                              disabled={!!updating}
                              onClick={() => updateOrderStatus(order.id, "completed")}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-800 text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {updating === order.id + "completed" ? "..." : "Complete"}
                            </button>
                          )}
                          {(order.status === "completed" || order.status === "cancelled") && (
                            <button
                              onClick={() => { setSelected(order); setNote(order.seller_notes || ""); }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                              View
                            </button>
                          )}
                          {order.status !== "completed" && order.status !== "cancelled" && (
                            <>
                              <button
                                onClick={() => { setSelected(order); setNote(order.seller_notes || ""); }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                              >
                                Details
                              </button>
                              <button
                                disabled={!!updating}
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {updating === order.id + "cancelled" ? "..." : "Cancel"}
                              </button>
                            </>
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

        {/* Order detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Order #{selected.id.slice(0, 8).toUpperCase()}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(selected.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>
                    {STATUS_LABEL[selected.status]}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-5">
                  {/* Customer info */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Customer</p>
                    <p className="text-sm font-semibold text-gray-800">{selected.customer_name || "Guest"}</p>
                    {selected.customer_email && <p className="text-xs text-gray-500">{selected.customer_email}</p>}
                    {selected.customer_phone && <p className="text-xs text-gray-500">{selected.customer_phone}</p>}
                  </div>

                  {/* Fulfillment */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Fulfillment</p>
                    <p className="text-sm text-gray-700 capitalize">{selected.fulfillment_type || "—"}</p>
                    {selected.fulfillment_address && (
                      <p className="text-xs text-gray-500 mt-0.5">{selected.fulfillment_address}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Items Ordered</p>
                    {selected.items.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No items found</p>
                    ) : (
                      <ul className="space-y-2">
                        {selected.items.map(item => (
                          <li key={item.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1a4a2e] shrink-0"/>
                              {item.product_name} &times; {item.quantity}
                            </span>
                            <span className="font-medium text-gray-800 tabular-nums">
                              {formatCurrency(item.total_price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">Order Total</span>
                      <span className="text-sm font-bold text-[#1a4a2e]">{formatCurrency(selected.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  {/* Timeline */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Order Timeline</p>
                    <ol className="space-y-2.5">
                      {TIMELINE_STEPS.map((step, i) => {
                        const currentIdx = TIMELINE_STEPS.indexOf(selected.status);
                        const done = selected.status !== "cancelled" && i <= currentIdx;
                        return (
                          <li key={step} className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#1a4a2e]" : "bg-gray-200"}`}>
                              {done && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5"/>
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm capitalize ${done ? "text-gray-800 font-medium" : "text-gray-400"}`}>{step}</span>
                          </li>
                        );
                      })}
                      {selected.status === "cancelled" && (
                        <li className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-red-500">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3l6 6M9 3l-6 6"/>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-red-500">Cancelled</span>
                        </li>
                      )}
                    </ol>
                  </div>

                  {/* Action buttons in modal */}
                  {selected.status !== "completed" && selected.status !== "cancelled" && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.status === "pending" && (
                          <button
                            disabled={!!updating}
                            onClick={() => updateOrderStatus(selected.id, "confirmed")}
                            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1a4a2e] hover:bg-[#2d6b47] text-white transition-colors disabled:opacity-50"
                          >
                            Confirm Order
                          </button>
                        )}
                        {selected.status === "confirmed" && (
                          <button
                            disabled={!!updating}
                            onClick={() => updateOrderStatus(selected.id, "ready")}
                            className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                          >
                            Mark as Ready
                          </button>
                        )}
                        {selected.status === "ready" && (
                          <button
                            disabled={!!updating}
                            onClick={() => updateOrderStatus(selected.id, "completed")}
                            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white transition-colors disabled:opacity-50"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          disabled={!!updating}
                          onClick={() => updateOrderStatus(selected.id, "cancelled")}
                          className="text-sm font-semibold px-4 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Seller note */}
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1.5">
                      Seller Notes
                    </label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add a note for this order..."
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition resize-none"
                    />
                    <button
                      onClick={saveNote}
                      disabled={savingNote}
                      className="mt-2 text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {savingNote ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
