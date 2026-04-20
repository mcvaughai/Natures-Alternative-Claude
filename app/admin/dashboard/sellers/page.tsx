"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

type SellerStatus = "Active" | "Suspended";

interface Seller {
  id: number; store: string; owner: string; location: string;
  products: number; sales: string; joined: string; status: SellerStatus; email: string;
  orders: number; rating: string;
}

const ALL_SELLERS: Seller[] = [
  { id:1, store:"Example Farms",      owner:"Jane Farmer",   location:"Asheville, NC", products:6,  sales:"$4,200", joined:"Nov 5, 2024",  status:"Active",    email:"jane@example.com",        orders:52, rating:"4.9" },
  { id:2, store:"Green Valley Farm",  owner:"John Smith",    location:"Austin, TX",    products:8,  sales:"$3,100", joined:"Nov 12, 2024", status:"Active",    email:"john@greenvalley.com",    orders:38, rating:"4.8" },
  { id:3, store:"Sunrise Organics",   owner:"Mary Johnson",  location:"Houston, TX",   products:5,  sales:"$2,800", joined:"Nov 20, 2024", status:"Active",    email:"mary@sunrise.com",        orders:31, rating:"4.7" },
  { id:4, store:"Heritage Acres",     owner:"Bob Wilson",    location:"Dallas, TX",    products:4,  sales:"$2,300", joined:"Dec 1, 2024",  status:"Active",    email:"bob@heritageacres.com",   orders:28, rating:"4.8" },
  { id:5, store:"Blue Ridge Honey",   owner:"Alice Turner",  location:"Raleigh, NC",   products:3,  sales:"$1,800", joined:"Nov 8, 2024",  status:"Active",    email:"alice@blueridge.com",     orders:21, rating:"4.9" },
  { id:6, store:"Prairie Wind",       owner:"Carl Nguyen",   location:"Denver, CO",    products:2,  sales:"$400",   joined:"Oct 15, 2024", status:"Suspended", email:"carl@prairiewind.com",    orders:4,  rating:"3.2" },
];

const STATUS_STYLES: Record<SellerStatus, string> = {
  Active:    "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-600",
};

export default function SellersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SellerStatus>("All");
  const [selected, setSelected] = useState<Seller | null>(null);

  const filtered = ALL_SELLERS.filter(s => {
    const matchSearch = !search || s.store.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    Active:    ALL_SELLERS.filter(s => s.status === "Active").length,
    Suspended: ALL_SELLERS.filter(s => s.status === "Suspended").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Manage Sellers</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Active",    value: counts.Active,                color:"text-green-700" },
            { label:"Suspended", value: counts.Suspended,             color:"text-red-600"   },
            { label:"Total",     value: ALL_SELLERS.length,           color:"text-gray-900"  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            <div className="flex gap-1">
              {(["All","Active","Suspended"] as const).map(s => (
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Store","Owner","Location","Products","Total Sales","Joined","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{s.store}</td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{s.owner}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{s.location}</td>
                    <td className="px-4 py-3.5 text-gray-500">{s.products}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">{s.sales}</td>
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
                        <button className="text-xs font-semibold text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                        <button className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${s.status === "Active" ? "text-red-500 border border-red-200 hover:bg-red-50" : "text-green-600 border border-green-200 hover:bg-green-50"}`}>
                          {s.status === "Active" ? "Suspend" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seller detail card */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">{selected.store}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Store Owner</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.owner}</p>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{selected.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Joined</p>
                  <p className="text-sm text-gray-700">{selected.joined}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Total Sales",  value: selected.sales },
                    { label:"Orders",       value: String(selected.orders) },
                    { label:"Products",     value: String(selected.products) },
                    { label:"Rating",       value: "★ " + selected.rating },
                  ].map(s => (
                    <div key={s.label} className="bg-[#f5f0e8] rounded-xl p-3">
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-base font-bold text-[#1a4a2e] mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Subscription</p>
                  <span className="inline-flex items-center text-xs font-medium bg-[#1a4a2e]/10 text-[#1a4a2e] px-2.5 py-0.5 rounded-full">Starter (Free)</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button className="text-sm font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-4 py-2 rounded-xl hover:bg-[#1a4a2e]/5 transition-colors">View Store Page</button>
                  {selected.status === "Active"
                    ? <button className="text-sm font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">Suspend Seller</button>
                    : <button className="text-sm font-semibold text-green-600 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">Reactivate Seller</button>
                  }
                  <button className="text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">Remove Seller</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
