"use client";

import { useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";

type Range = "7d" | "30d" | "90d";

const RANGES: { label: string; value: Range }[] = [
  { label: "Last 7 Days",  value: "7d"  },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
];

const DATA: Record<Range, {
  revenue: string; orders: number; customers: number; views: number;
  revTrend: string; orderTrend: string;
  bestSellers: { name: string; sold: number; revenue: string; trend: "up"|"down"|"flat" }[];
  fulfillment: { type: string; count: number; pct: number }[];
}> = {
  "7d": {
    revenue: "$312.00", orders: 8, customers: 6, views: 94,
    revTrend: "+14%", orderTrend: "+2",
    bestSellers: [
      { name: "Pancakes Mix",     sold: 12, revenue: "$72.00",  trend: "up"   },
      { name: "Fresh Eggs (12)",  sold: 8,  revenue: "$64.00",  trend: "flat" },
      { name: "Raw Honey 16oz",   sold: 5,  revenue: "$60.00",  trend: "up"   },
      { name: "Grass-Fed Beef",   sold: 3,  revenue: "$54.00",  trend: "down" },
    ],
    fulfillment: [
      { type: "Pickup",         count: 4, pct: 50 },
      { type: "Local Delivery", count: 3, pct: 37 },
      { type: "Shipping",       count: 1, pct: 13 },
    ],
  },
  "30d": {
    revenue: "$1,240.00", orders: 24, customers: 18, views: 342,
    revTrend: "+12%", orderTrend: "+8%",
    bestSellers: [
      { name: "Pancakes Mix",     sold: 24, revenue: "$144.00", trend: "up"   },
      { name: "Fresh Eggs (12)",  sold: 18, revenue: "$144.00", trend: "up"   },
      { name: "Raw Honey 16oz",   sold: 11, revenue: "$132.00", trend: "flat" },
      { name: "Grass-Fed Beef",   sold: 9,  revenue: "$162.00", trend: "up"   },
      { name: "Heritage Tomatoes",sold: 7,  revenue: "$38.50",  trend: "down" },
    ],
    fulfillment: [
      { type: "Pickup",         count: 11, pct: 46 },
      { type: "Local Delivery", count: 9,  pct: 37 },
      { type: "Shipping",       count: 4,  pct: 17 },
    ],
  },
  "90d": {
    revenue: "$3,880.00", orders: 71, customers: 44, views: 980,
    revTrend: "+22%", orderTrend: "+18%",
    bestSellers: [
      { name: "Pancakes Mix",     sold: 68, revenue: "$408.00", trend: "up"   },
      { name: "Fresh Eggs (12)",  sold: 55, revenue: "$440.00", trend: "up"   },
      { name: "Grass-Fed Beef",   sold: 32, revenue: "$576.00", trend: "up"   },
      { name: "Raw Honey 16oz",   sold: 29, revenue: "$348.00", trend: "flat" },
      { name: "Heritage Tomatoes",sold: 18, revenue: "$99.00",  trend: "down" },
    ],
    fulfillment: [
      { type: "Pickup",         count: 33, pct: 46 },
      { type: "Local Delivery", count: 26, pct: 37 },
      { type: "Shipping",       count: 12, pct: 17 },
    ],
  },
};

const TREND_ICON = {
  up:   <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>,
  down: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-red-500"   fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>,
  flat: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400"  fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14"/></svg>,
};

const BAR_COLORS = ["bg-[#1a4a2e]", "bg-[#2d6b47]", "bg-[#4a8c64]"];

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const d = DATA[range];

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${range === r.value ? "bg-[#1a4a2e] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue",         value: d.revenue,          trend: d.revTrend,   trendColor: "text-green-600" },
            { label: "Total Orders",    value: String(d.orders),   trend: d.orderTrend, trendColor: "text-green-600" },
            { label: "Unique Customers",value: String(d.customers),trend: null,         trendColor: "" },
            { label: "Store Views",     value: String(d.views),    trend: null,         trendColor: "" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#1a4a2e]">{s.value}</p>
              {s.trend && <p className={`text-xs font-medium mt-1 ${s.trendColor}`}>↑ {s.trend} vs prior period</p>}
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Revenue Over Time</h2>
            <span className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1">Daily</span>
          </div>
          <div className="h-40 flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p className="text-sm font-medium text-gray-400">Chart coming soon</p>
            <p className="text-xs text-gray-400">Revenue visualization will appear here</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Best sellers */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Best Selling Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Product","Units Sold","Revenue","Trend"].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.bestSellers.map((p, i) => (
                    <tr key={p.name}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                          <div className="w-7 h-7 rounded-lg bg-gray-200 shrink-0"/>
                          <span className="font-medium text-gray-800 whitespace-nowrap">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{p.sold}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-800 tabular-nums">{p.revenue}</td>
                      <td className="py-3">{TREND_ICON[p.trend]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Fulfillment breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Fulfillment Breakdown</h2>
              <div className="space-y-3">
                {d.fulfillment.map((f, i) => (
                  <div key={f.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{f.type}</span>
                      <span className="text-sm font-semibold text-gray-800 tabular-nums">{f.count} orders ({f.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${BAR_COLORS[i]}`} style={{ width: `${f.pct}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Customer Insights</h2>
              <div className="space-y-3">
                {[
                  { label: "Repeat Customers", value: "62%" },
                  { label: "Avg Order Value",  value: "$23.40" },
                  { label: "Customer Rating",  value: "4.8 / 5" },
                  { label: "Conversion Rate",  value: "4.2%" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className="text-sm font-bold text-[#1a4a2e]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
