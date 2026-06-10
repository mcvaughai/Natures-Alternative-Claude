"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import { getValidSellerSession, getAuthHeaders } from "@/lib/sessionHelper";
import {
  IconShoppingBag,
  IconAlertTriangle,
  IconCircleCheck,
  IconPrinter,
  IconClock,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Seller {
  id: string;
  farm_name: string;
  slug: string;
  status: string;
  fulfillment: string[] | null;
  pickup_hours: string | null;
}

interface Order {
  id: string;
  status: "pending" | "confirmed" | "ready";
  total_amount: number;
  fulfillment_type: string | null;
  created_at: string;
  customer_id: string;
  customer_name: string | null;
}

interface OrderItem {
  order_id: string;
  product_id: string;
  quantity: number;
  product_name: string;
}

interface Product {
  id: string;
  name: string;
  stock_qty: number | null;
  low_stock_threshold: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const h = new Date().getHours();
  const word = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${word}, ${name}`;
}

function getMondayOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatCurrency(cents: number): string {
  return `$${Number(cents).toFixed(2)}`;
}

function itemsSummary(items: OrderItem[]): string {
  if (!items.length) return "—";
  return items.map(i => `${i.product_name} ×${i.quantity}`).join(", ");
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Default pickup days: Thu–Sun (indices 3–6 in Mon-based week)
const DEFAULT_PICKUP_INDICES = [3, 4, 5, 6];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:   { label: "New",       cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Preparing", cls: "bg-blue-100 text-blue-700"   },
  ready:     { label: "Ready",     cls: "bg-green-100 text-green-700" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TodayPage() {
  // ── State ──
  const [loading, setLoading]           = useState(true);
  const [seller, setSeller]             = useState<Seller | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [weekRevenue, setWeekRevenue]   = useState(0);
  const [lowStock, setLowStock]         = useState<Product[]>([]);
  const [orderItems, setOrderItems]     = useState<Record<string, OrderItem[]>>({});
  const [sess, setSess]                 = useState<{ access_token: string; seller_id: string } | null>(null);

  // Mark-ready modal
  const [showMarkReady, setShowMarkReady]           = useState(false);
  const [markChecked, setMarkChecked]               = useState<Record<string, boolean>>({});
  const [markingReady, setMarkingReady]             = useState(false);
  const [markReadyDone, setMarkReadyDone]           = useState(false);

  // Pickup-lookup modal
  const [showLookup, setShowLookup]     = useState(false);
  const [lookupQuery, setLookupQuery]   = useState("");
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const lookupRef                       = useRef<HTMLInputElement>(null);

  // ── Fetch ──
  const fetchAll = useCallback(async (session: { access_token: string; seller_id: string }) => {
    const h = getAuthHeaders(session.access_token);
    const monday = getMondayOfWeek();
    try {
      const [sellerRes, activeRes, revenueRes, stockRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/sellers?id=eq.${session.seller_id}&select=id,farm_name,slug,status,fulfillment,pickup_hours`, { headers: h }),
        fetch(`${SUPABASE_URL}/rest/v1/orders?seller_id=eq.${session.seller_id}&status=in.(pending,confirmed,ready)&select=id,status,total_amount,fulfillment_type,created_at,customer_id,customer_name&order=created_at.desc`, { headers: h }),
        fetch(`${SUPABASE_URL}/rest/v1/orders?seller_id=eq.${session.seller_id}&status=eq.completed&created_at=gte.${monday.toISOString()}&select=total_amount`, { headers: h }),
        fetch(`${SUPABASE_URL}/rest/v1/products?seller_id=eq.${session.seller_id}&status=eq.active&select=id,name,stock_qty,low_stock_threshold`, { headers: h }),
      ]);

      const [sellerData, activeData, revenueData, stockData] = await Promise.all([
        sellerRes.json(), activeRes.json(), revenueRes.json(), stockRes.json(),
      ]);

      setSeller(Array.isArray(sellerData) ? (sellerData[0] ?? null) : null);

      const orders: Order[] = Array.isArray(activeData) ? activeData : [];
      setActiveOrders(orders);

      const revenue = (Array.isArray(revenueData) ? revenueData : [])
        .reduce((s: number, o: { total_amount: number }) => s + (o.total_amount || 0), 0);
      setWeekRevenue(revenue);

      const products: Product[] = Array.isArray(stockData) ? stockData : [];
      setLowStock(products.filter(p => {
        const qty = p.stock_qty ?? 0;
        if (p.low_stock_threshold !== null && p.low_stock_threshold !== undefined)
          return qty <= p.low_stock_threshold;
        return qty <= 3;
      }));

      // Fetch items for first 3 orders
      if (orders.length > 0) {
        const ids = orders.slice(0, 3).map(o => o.id).join(",");
        const itemsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/order_items?order_id=in.(${ids})&select=order_id,product_id,quantity,product_name`,
          { headers: h }
        );
        const itemsData = await itemsRes.json();
        if (Array.isArray(itemsData)) {
          const map: Record<string, OrderItem[]> = {};
          for (const item of itemsData) {
            if (!map[item.order_id]) map[item.order_id] = [];
            map[item.order_id].push(item);
          }
          setOrderItems(map);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getValidSellerSession().then(session => {
      if (!session) return;
      setSess(session);
      fetchAll(session);
    });
  }, [fetchAll]);

  // ── Mark-ready handler ──
  const handleMarkReady = async () => {
    if (!sess) return;
    const ids = Object.entries(markChecked).filter(([, v]) => v).map(([id]) => id);
    if (!ids.length) return;
    setMarkingReady(true);
    try {
      const h = { ...getAuthHeaders(sess.access_token), "Content-Type": "application/json" };
      await Promise.all(ids.map(id =>
        fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
          method: "PATCH", headers: h,
          body: JSON.stringify({ status: "ready", updated_at: new Date().toISOString() }),
        })
      ));
      setMarkReadyDone(true);
      setTimeout(() => {
        setShowMarkReady(false);
        setMarkReadyDone(false);
        fetchAll(sess);
      }, 1200);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setMarkingReady(false);
    }
  };

  // ── Mark collected handler ──
  const handleMarkCollected = async (orderId: string) => {
    if (!sess) return;
    setUpdatingId(orderId);
    try {
      const h = { ...getAuthHeaders(sess.access_token), "Content-Type": "application/json" };
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: "PATCH", headers: h,
        body: JSON.stringify({ status: "completed", updated_at: new Date().toISOString() }),
      });
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Print packing list ──
  const printPackingList = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const body = activeOrders.length === 0
      ? "<p>No active orders.</p>"
      : activeOrders.map(o => {
          const items = orderItems[o.id] || [];
          const rows = items.length
            ? items.map(i => `<li><label><input type="checkbox"> ${i.product_name} &times;${i.quantity}</label></li>`).join("")
            : "<li><em>Items not loaded — check Orders page</em></li>";
          return `<div class="order">
            <h2>#${o.id.slice(0, 8).toUpperCase()}</h2>
            <p class="meta">${o.fulfillment_type || "Farm Pickup"} &nbsp;·&nbsp; ${formatCurrency(o.total_amount)}</p>
            <ul>${rows}</ul>
          </div>`;
        }).join("<hr>");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Packing List</title>
<style>
  body{font-family:Arial,sans-serif;padding:32px;color:#000;max-width:700px;margin:0 auto}
  h1{font-size:20px;margin:0 0 4px}
  .sub{font-size:12px;color:#666;margin:0 0 28px}
  hr{border:none;border-top:1px solid #ccc;margin:24px 0}
  .order h2{font-size:15px;margin:0 0 4px}
  .order .meta{font-size:12px;color:#555;margin:0 0 10px}
  ul{list-style:none;padding:0;margin:0}
  li{padding:5px 0;border-bottom:1px solid #eee;font-size:13px}
  li:last-child{border:none}
  @media print{body{padding:0}}
</style></head><body>
<h1>${seller?.farm_name ?? "Farm"} — Packing List</h1>
<p class="sub">${dateStr} &nbsp;·&nbsp; ${activeOrders.length} active order${activeOrders.length !== 1 ? "s" : ""}</p>
${body}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`);
    win.document.close();
  };

  // ── Derived ──
  const pendingOrders   = activeOrders.filter(o => o.status === "pending");
  const confirmedOrders = activeOrders.filter(o => o.status === "confirmed");
  const pickupCount     = activeOrders.filter(o => !(o.fulfillment_type ?? "").toLowerCase().includes("delivery")).length;
  const deliveryCount   = activeOrders.filter(o => (o.fulfillment_type ?? "").toLowerCase().includes("delivery")).length;
  const recentOrders    = activeOrders.slice(0, 3);

  // Schedule
  const today           = new Date();
  const todayMon        = (today.getDay() + 6) % 7; // 0=Mon … 6=Sun
  const weekDates       = DAYS.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayMon + i);
    return d;
  });
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Lookup filter
  const lookupResults = lookupQuery.trim()
    ? activeOrders.filter(o => o.id.toLowerCase().includes(lookupQuery.toLowerCase().trim()))
    : activeOrders;

  if (loading) return (
    <SellerLayout>
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#053D2D", borderTopColor: "transparent" }} />
      </div>
    </SellerLayout>
  );

  return (
    <SellerLayout>
      <div className="space-y-4 max-w-6xl">

        {/* ── Header ── */}
        <div className="bg-white rounded-xl px-5 py-4 flex items-center justify-between" style={{ border: "0.5px solid #e5e7eb" }}>
          <div>
            <p className="text-gray-900" style={{ fontSize: 16, fontWeight: 500 }}>
              {getGreeting(seller?.farm_name ?? "Seller")}
            </p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>
              {dateStr}
              {seller?.pickup_hours ? ` — Farm pickup open today ${seller.pickup_hours}` : ""}
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-3">
          {/* Orders today */}
          <div className="bg-white rounded-xl p-4" style={{ border: "0.5px solid #e5e7eb" }}>
            <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>Orders Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{activeOrders.length}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{pickupCount} pickup · {deliveryCount} delivery</p>
          </div>
          {/* Revenue this week */}
          <div className="bg-white rounded-xl p-4" style={{ border: "0.5px solid #e5e7eb" }}>
            <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>Revenue This Week</p>
            <p className="text-3xl font-bold mt-1" style={{ color: "#053D2D" }}>{formatCurrency(weekRevenue)}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>Completed orders</p>
          </div>
          {/* Low stock */}
          <div className="bg-white rounded-xl p-4" style={{ border: lowStock.length > 0 ? "0.5px solid #f59e0b" : "0.5px solid #e5e7eb" }}>
            <p className="uppercase font-semibold tracking-widest" style={{ fontSize: 10, color: lowStock.length > 0 ? "#d97706" : "#9ca3af" }}>Low Stock</p>
            <p className="text-3xl font-bold mt-1" style={{ color: lowStock.length > 0 ? "#d97706" : "#111827" }}>{lowStock.length}</p>
            <p className="mt-0.5" style={{ fontSize: 11, color: lowStock.length > 0 ? "#d97706" : "#22c55e" }}>
              {lowStock.length > 0 ? "Needs attention" : "All good"}
            </p>
          </div>
          {/* New customers */}
          <div className="bg-white rounded-xl p-4" style={{ border: "0.5px solid #e5e7eb" }}>
            <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>New Customers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>Coming soon</p>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-3 gap-4 items-start">

          {/* ── Left col (2/3) ── */}
          <div className="col-span-2 space-y-4">

            {/* Needs Attention */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #e5e7eb" }}>
              <div className="px-5 pt-4 pb-2">
                <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>Needs Attention</p>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {pendingOrders.length === 0 && lowStock.length === 0 ? (
                  <div className="flex items-center gap-3 px-2 py-3 rounded-lg" style={{ backgroundColor: "#f0fdf4" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
                      <IconCircleCheck size={16} color="#16a34a" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">You&apos;re all caught up!</p>
                      <p className="text-xs text-gray-500 mt-0.5">No action needed right now</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {pendingOrders.length > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "#fef2f2" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#fee2e2" }}>
                          <IconShoppingBag size={16} color="#dc2626" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""} need to be packed
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {pendingOrders.filter(o => !(o.fulfillment_type ?? "").toLowerCase().includes("delivery")).length} pickup
                            &nbsp;·&nbsp;
                            {pendingOrders.filter(o => (o.fulfillment_type ?? "").toLowerCase().includes("delivery")).length} delivery
                            {seller?.pickup_hours ? ` · Next pickup ${seller.pickup_hours}` : ""}
                          </p>
                        </div>
                        <Link href="/seller/dashboard/orders"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                          style={{ border: "1px solid #fca5a5", color: "#dc2626" }}>
                          View
                        </Link>
                      </div>
                    )}
                    {lowStock.length > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "#fffbeb" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#fef3c7" }}>
                          <IconAlertTriangle size={16} color="#d97706" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} running low
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {lowStock.slice(0, 3).map(p => p.name).join(", ")}
                            {lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ""}
                          </p>
                        </div>
                        <Link href="/seller/dashboard/inventory"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                          style={{ border: "1px solid #fcd34d", color: "#d97706" }}>
                          Update
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #e5e7eb" }}>
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>Recent Orders</p>
                <Link href="/seller/dashboard/orders" className="text-xs font-semibold hover:underline" style={{ color: "#053D2D" }}>
                  View all
                </Link>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No active orders right now</p>
                ) : recentOrders.map(order => {
                  const items = orderItems[order.id] || [];
                  const badge = STATUS_BADGE[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-600" };
                  const fulfillLabel = (order.fulfillment_type ?? "").toLowerCase().includes("delivery") ? "Local delivery" : "Farm pickup";
                  return (
                    <div key={order.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: "0.5px solid #f3f4f6" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{itemsSummary(items)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fulfillLabel}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 shrink-0 mt-0.5">{formatCurrency(order.total_amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Right col (1/3) ── */}
          <div className="space-y-4">

            {/* Schedule */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #e5e7eb" }}>
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>This Week&apos;s Schedule</p>
                <Link href="/seller/dashboard/fulfillment" className="text-xs font-semibold hover:underline" style={{ color: "#053D2D" }}>Edit</Link>
              </div>
              {!seller?.pickup_hours ? (
                <div className="px-5 pb-5 text-center space-y-1">
                  <p className="text-xs text-gray-400">No schedule set yet</p>
                  <Link href="/seller/dashboard/fulfillment" className="text-xs font-semibold hover:underline" style={{ color: "#053D2D" }}>
                    Set pickup hours →
                  </Link>
                </div>
              ) : (
                <div className="px-2 pb-3">
                  {DAYS.map((day, i) => {
                    const isToday = i === todayMon;
                    const isPickup = DEFAULT_PICKUP_INDICES.includes(i);
                    const d = weekDates[i];
                    return (
                      <div key={day} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={isToday ? { backgroundColor: "#f0fdf4" } : {}}>
                        <div className="w-8 shrink-0">
                          <p className="text-xs font-semibold text-gray-600">{day}</p>
                          <p className="text-xs text-gray-300">{d.getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          {isPickup
                            ? <p className="text-xs text-gray-700 truncate">{seller.pickup_hours}</p>
                            : <p className="text-xs text-gray-300">—</p>
                          }
                        </div>
                        {isToday && (
                          <span className="text-white font-bold rounded px-1.5 py-0.5" style={{ fontSize: 9, backgroundColor: "#053D2D" }}>
                            TODAY
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #e5e7eb" }}>
              <div className="px-5 pt-4 pb-2">
                <p className="uppercase text-gray-400 font-semibold tracking-widest" style={{ fontSize: 10 }}>Quick Actions</p>
              </div>
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                <button onClick={printPackingList}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors text-center"
                  style={{ border: "0.5px solid #e5e7eb" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                  <IconPrinter size={20} stroke={1.5} color="#6b7280" />
                  <span className="text-xs font-medium text-gray-700 leading-tight">Print Packing List</span>
                </button>

                <button onClick={() => {
                    const init: Record<string, boolean> = {};
                    confirmedOrders.forEach(o => { init[o.id] = true; });
                    setMarkChecked(init);
                    setShowMarkReady(true);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors text-center text-white"
                  style={{ backgroundColor: "#053D2D" }}>
                  <IconCircleCheck size={20} stroke={1.5} />
                  <span className="text-xs font-medium leading-tight">Mark Orders Ready</span>
                </button>

                <Link href="/seller/dashboard/fulfillment"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors text-center"
                  style={{ border: "0.5px solid #e5e7eb" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                  <IconClock size={20} stroke={1.5} color="#6b7280" />
                  <span className="text-xs font-medium text-gray-700 leading-tight">Edit Schedule</span>
                </Link>

                <button onClick={() => {
                    setLookupQuery("");
                    setShowLookup(true);
                    setTimeout(() => lookupRef.current?.focus(), 80);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors text-center"
                  style={{ border: "0.5px solid #e5e7eb" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                  <IconSearch size={20} stroke={1.5} color="#6b7280" />
                  <span className="text-xs font-medium text-gray-700 leading-tight">Pickup Lookup</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Mark Orders Ready Modal ── */}
      {showMarkReady && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMarkReady(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <h2 className="text-base font-bold text-gray-900">Mark orders ready for pickup</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {confirmedOrders.length} confirmed order{confirmedOrders.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={() => setShowMarkReady(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <IconX size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-2">
              {confirmedOrders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No confirmed orders to mark ready.</p>
              ) : confirmedOrders.map(order => {
                const items = orderItems[order.id] || [];
                return (
                  <label key={order.id} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                    style={{ border: "0.5px solid #e5e7eb" }}>
                    <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#053D2D]"
                      checked={markChecked[order.id] ?? false}
                      onChange={e => setMarkChecked(prev => ({ ...prev, [order.id]: e.target.checked }))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-sm font-semibold text-gray-700">{formatCurrency(order.total_amount)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{itemsSummary(items)}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: "1px solid #f3f4f6" }}>
              {markReadyDone ? (
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                  <IconCircleCheck size={16} /> Orders marked ready!
                </div>
              ) : (
                <>
                  <button onClick={handleMarkReady}
                    disabled={markingReady || !Object.values(markChecked).some(Boolean)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: "#053D2D" }}>
                    {markingReady ? "Updating…" : "Mark All Ready"}
                  </button>
                  <button onClick={() => setShowMarkReady(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-colors"
                    style={{ border: "1px solid #d1d5db" }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Pickup Lookup Modal ── */}
      {showLookup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLookup(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col" style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <h2 className="text-base font-bold text-gray-900">Pickup Lookup</h2>
                <p className="text-xs text-gray-400 mt-0.5">Search by order number</p>
              </div>
              <button onClick={() => setShowLookup(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <IconX size={18} />
              </button>
            </div>
            {/* Search input */}
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <input ref={lookupRef} type="search" placeholder="Search order number…"
                value={lookupQuery} onChange={e => setLookupQuery(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition"
                style={{ border: "1px solid #d1d5db" }} />
            </div>
            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {lookupResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {lookupQuery.trim() ? "No orders found" : "Start typing to search"}
                </p>
              ) : lookupResults.map(order => {
                const items = orderItems[order.id] || [];
                const badge = STATUS_BADGE[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-600" };
                const fulfillLabel = (order.fulfillment_type ?? "").toLowerCase().includes("delivery") ? "Local delivery" : "Farm pickup";
                return (
                  <div key={order.id} className="p-3 rounded-xl transition-colors" style={{ border: "0.5px solid #e5e7eb" }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{itemsSummary(items)}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-400">{fulfillLabel}</p>
                      <button onClick={() => handleMarkCollected(order.id)}
                        disabled={updatingId === order.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition-colors"
                        style={{ backgroundColor: "#053D2D" }}>
                        {updatingId === order.id ? "Updating…" : "Mark as Collected"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div className="px-6 py-4" style={{ borderTop: "1px solid #f3f4f6" }}>
              <button onClick={() => setShowLookup(false)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-colors"
                style={{ border: "1px solid #d1d5db" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </SellerLayout>
  );
}
