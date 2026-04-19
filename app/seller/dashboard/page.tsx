"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SellerLayout from "@/components/seller/SellerLayout";

const RECENT_ORDERS = [
  { id: "NA-001", customer: "John D.",  items: 3, total: "$23.40", fulfillment: "Pickup",   status: "Pending",   action: "Confirm"     },
  { id: "NA-002", customer: "Sarah M.", items: 2, total: "$15.00", fulfillment: "Delivery", status: "Confirmed", action: "Mark Ready"  },
  { id: "NA-003", customer: "Mike R.",  items: 5, total: "$45.00", fulfillment: "Shipping", status: "Shipped",   action: "Track"       },
  { id: "NA-004", customer: "Lisa K.",  items: 1, total: "$8.00",  fulfillment: "Pickup",   status: "Completed", action: "View"        },
];

const TOP_PRODUCTS = [
  { name: "Pancakes Mix",     price: "$6.00",  sold: 24, stock: "In Stock"     },
  { name: "Fresh Eggs (12)",  price: "$8.00",  sold: 18, stock: "Low Stock"    },
  { name: "Raw Honey 16oz",   price: "$12.00", sold: 11, stock: "In Stock"     },
  { name: "Heritage Tomatoes",price: "$5.50",  sold: 9,  stock: "Out of Stock" },
];

const STATUS_STYLES: Record<string, string> = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Shipped:   "bg-blue-100 text-blue-700",
  Completed: "bg-gray-100 text-gray-600",
};
const STOCK_STYLES: Record<string, string> = {
  "In Stock":     "bg-green-100 text-green-700",
  "Low Stock":    "bg-orange-100 text-orange-700",
  "Out of Stock": "bg-red-100 text-red-600",
};
const ACTION_STYLES: Record<string, string> = {
  Confirm:     "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white",
  "Mark Ready":"bg-blue-600 hover:bg-blue-700 text-white",
  Track:       "border border-[#1a4a2e] text-[#1a4a2e] hover:bg-[#1a4a2e]/5",
  View:        "border border-gray-300 text-gray-600 hover:bg-gray-50",
};

function StatCard({ label, value, sub, subColor = "text-gray-400", trend }: {
  label: string; value: string; sub: string; subColor?: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#1a4a2e] mb-1">{value}</p>
      <p className={`text-xs ${subColor}`}>{sub}</p>
      {trend && <p className="text-xs text-green-600 font-medium mt-0.5">↑ {trend}</p>}
    </div>
  );
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Example Farms! 🌿</h1>
          <p className="text-sm text-gray-400 mt-1">{today}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value="$1,240.00" sub="This month" trend="12% from last month" />
          <StatCard label="Total Orders" value="24" sub="This month" trend="8% from last month" />
          <StatCard label="Active Products" value="18" sub="Listed" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-[#1a4a2e] mb-1">3</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <p className="text-xs text-orange-500 font-medium">Need attention</p>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <Link href="/seller/dashboard/orders" className="text-xs text-[#1a4a2e] font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Order #","Customer","Items","Total","Fulfillment","Status",""].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">#{o.id}</td>
                    <td className="py-3 pr-4 text-gray-700">{o.customer}</td>
                    <td className="py-3 pr-4 text-gray-500">{o.items} items</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800 tabular-nums">{o.total}</td>
                    <td className="py-3 pr-4 text-gray-500">{o.fulfillment}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => router.push(`/seller/dashboard/orders`)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${ACTION_STYLES[o.action] ?? "border border-gray-300 text-gray-600"}`}>
                        {o.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Top Products</h2>
              <Link href="/seller/dashboard/products" className="text-xs text-[#1a4a2e] font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {TOP_PRODUCTS.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.price} · {p.sold} sold</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STOCK_STYLES[p.stock]}`}>{p.stock}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Store performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Store Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Store Views",          value: "342", sub: "this month"  },
                { label: "Conversion Rate",       value: "4.2%", sub: "of visitors" },
                { label: "Avg Order Value",       value: "$23.40", sub: "per order" },
                { label: "Customer Rating",       value: "4.8 / 5", sub: "avg rating" },
              ].map(s => (
                <div key={s.label} className="bg-[#f5f0e8] rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-[#1a4a2e]">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Add New Product", href: "/seller/dashboard/products", dark: true, icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            )},
            { label: "Edit Store", href: "/seller/dashboard/store-editor", dark: false, icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            )},
            { label: "View Orders", href: "/seller/dashboard/orders", dark: false, icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            )},
            { label: "View Analytics", href: "/seller/dashboard/analytics", dark: false, icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            )},
          ].map(action => (
            <button key={action.label} onClick={() => router.push(action.href)}
              className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl font-semibold text-sm transition-colors ${
                action.dark ? "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white shadow-sm" : "bg-white hover:shadow-md border border-gray-100 text-[#1a4a2e]"
              }`}>
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </SellerLayout>
  );
}
