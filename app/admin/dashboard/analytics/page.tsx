"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

type Range = "7d" | "30d" | "3m" | "year";

const RANGES: { label: string; value: Range }[] = [
  { label:"Last 7 Days",    value:"7d"   },
  { label:"Last 30 Days",   value:"30d"  },
  { label:"Last 3 Months",  value:"3m"   },
  { label:"This Year",      value:"year" },
];

const DATA: Record<Range, {
  revenue: string; orders: number; newCustomers: number; newSellers: number;
  topFarms: { name: string; orders: number; revenue: string; rating: string }[];
  topProducts: { name: string; farm: string; units: number; revenue: string }[];
  customerGrowth: { month: string; new: number; total: number }[];
}> = {
  "7d": {
    revenue: "$312", orders: 8, newCustomers: 3, newSellers: 0,
    topFarms: [
      { name:"Example Farms",    orders:4, revenue:"$142", rating:"4.9" },
      { name:"Green Valley Farm",orders:2, revenue:"$88",  rating:"4.8" },
      { name:"Sunrise Organics", orders:1, revenue:"$45",  rating:"4.7" },
      { name:"Heritage Acres",   orders:1, revenue:"$37",  rating:"4.8" },
    ],
    topProducts: [
      { name:"Pancakes Mix",    farm:"Example Farms",    units:8, revenue:"$48" },
      { name:"Fresh Eggs (12)", farm:"Example Farms",    units:5, revenue:"$40" },
      { name:"Raw Honey 16oz",  farm:"Blue Ridge Honey", units:3, revenue:"$36" },
    ],
    customerGrowth: [{ month:"This Week", new: 3, total: 156 }],
  },
  "30d": {
    revenue: "$1,240", orders: 24, newCustomers: 14, newSellers: 2,
    topFarms: [
      { name:"Example Farms",    orders:12, revenue:"$440", rating:"4.9" },
      { name:"Green Valley Farm",orders:7,  revenue:"$320", rating:"4.8" },
      { name:"Sunrise Organics", orders:3,  revenue:"$185", rating:"4.7" },
      { name:"Heritage Acres",   orders:2,  revenue:"$295", rating:"4.8" },
    ],
    topProducts: [
      { name:"Pancakes Mix",    farm:"Example Farms",    units:24, revenue:"$144" },
      { name:"Fresh Eggs (12)", farm:"Example Farms",    units:18, revenue:"$144" },
      { name:"Raw Honey 16oz",  farm:"Blue Ridge Honey", units:11, revenue:"$132" },
      { name:"Grass-Fed Beef",  farm:"Heritage Acres",   units:9,  revenue:"$162" },
    ],
    customerGrowth: [
      { month:"Nov", new:8,  total:142 },
      { month:"Dec", new:14, total:156 },
    ],
  },
  "3m": {
    revenue: "$3,880", orders: 71, newCustomers: 44, newSellers: 5,
    topFarms: [
      { name:"Example Farms",    orders:34, revenue:"$1,240", rating:"4.9" },
      { name:"Green Valley Farm",orders:18, revenue:"$890",   rating:"4.8" },
      { name:"Sunrise Organics", orders:11, revenue:"$640",   rating:"4.7" },
      { name:"Heritage Acres",   orders:8,  revenue:"$810",   rating:"4.8" },
    ],
    topProducts: [
      { name:"Pancakes Mix",    farm:"Example Farms",    units:68, revenue:"$408" },
      { name:"Fresh Eggs (12)", farm:"Example Farms",    units:55, revenue:"$440" },
      { name:"Grass-Fed Beef",  farm:"Heritage Acres",   units:32, revenue:"$576" },
      { name:"Raw Honey 16oz",  farm:"Blue Ridge Honey", units:29, revenue:"$348" },
    ],
    customerGrowth: [
      { month:"Oct", new:12, total:112 },
      { month:"Nov", new:18, total:130 },
      { month:"Dec", new:14, total:156 },
    ],
  },
  "year": {
    revenue: "$12,400", orders: 124, newCustomers: 156, newSellers: 9,
    topFarms: [
      { name:"Example Farms",    orders:52, revenue:"$4,200", rating:"4.9" },
      { name:"Green Valley Farm",orders:38, revenue:"$3,100", rating:"4.8" },
      { name:"Sunrise Organics", orders:31, revenue:"$2,800", rating:"4.7" },
      { name:"Heritage Acres",   orders:28, revenue:"$2,300", rating:"4.8" },
    ],
    topProducts: [
      { name:"Pancakes Mix",    farm:"Example Farms",    units:144, revenue:"$864"   },
      { name:"Fresh Eggs (12)", farm:"Example Farms",    units:108, revenue:"$864"   },
      { name:"Grass-Fed Beef",  farm:"Heritage Acres",   units:72,  revenue:"$1,296" },
      { name:"Raw Honey 16oz",  farm:"Blue Ridge Honey", units:66,  revenue:"$792"   },
    ],
    customerGrowth: [
      { month:"Sep", new:8,  total:88  },
      { month:"Oct", new:12, total:100 },
      { month:"Nov", new:30, total:130 },
      { month:"Dec", new:26, total:156 },
    ],
  },
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const d = DATA[range];

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Platform Analytics</h1>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${range === r.value ? "bg-[#1a4a2e] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Total Revenue",   value: d.revenue,             color:"text-[#1a4a2e]" },
            { label:"Total Orders",    value: String(d.orders),      color:"text-[#1a4a2e]" },
            { label:"New Customers",   value: String(d.newCustomers),color:"text-[#1a4a2e]" },
            { label:"New Sellers",     value: String(d.newSellers),  color:"text-[#1a4a2e]" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Platform Revenue Over Time</h2>
          <div className="h-48 flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p className="text-sm font-medium text-gray-400">Chart coming soon</p>
            <p className="text-xs text-gray-400">Revenue visualization will appear here in the backend phase</p>
          </div>
        </div>

        {/* Top farms + Top products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Top Farms</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Farm","Orders","Revenue","Rating"].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.topFarms.map((f, i) => (
                    <tr key={f.name}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-4">{i+1}</span>
                          <span className="font-medium text-gray-800 whitespace-nowrap">{f.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{f.orders}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-800 tabular-nums">{f.revenue}</td>
                      <td className="py-3 text-yellow-600 font-medium">★ {f.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Top Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Product","Farm","Units","Revenue"].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.topProducts.map((p, i) => (
                    <tr key={p.name}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-4">{i+1}</span>
                          <span className="font-medium text-gray-800 whitespace-nowrap">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{p.farm}</td>
                      <td className="py-3 pr-4 text-gray-700">{p.units}</td>
                      <td className="py-3 font-semibold text-gray-800 tabular-nums">{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer growth */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Customer Growth</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Month","New Customers","Total Customers"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {d.customerGrowth.map(row => (
                  <tr key={row.month} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.month}</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">+{row.new}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
