"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

type ProdStatus = "Active" | "Pending Review" | "Removed";

interface Product {
  id: number; name: string; farm: string; category: string;
  price: string; stock: number; status: ProdStatus; added: string;
}

const ALL_PRODUCTS: Product[] = [
  { id:1, name:"Pancakes Mix",       farm:"Example Farms",    category:"Baked Goods",         price:"$6.00",  stock:40, status:"Active",        added:"Nov 5, 2024"  },
  { id:2, name:"Fresh Eggs (12)",    farm:"Example Farms",    category:"Dairy & Eggs",         price:"$8.00",  stock:5,  status:"Active",        added:"Nov 5, 2024"  },
  { id:3, name:"Raw Honey 16oz",     farm:"Blue Ridge Honey", category:"Other",                price:"$12.00", stock:22, status:"Active",        added:"Nov 8, 2024"  },
  { id:4, name:"Heritage Tomatoes",  farm:"Green Valley Farm",category:"Fruits & Vegetables",  price:"$5.50",  stock:0,  status:"Active",        added:"Nov 12, 2024" },
  { id:5, name:"Herb Bundle",        farm:"Sunrise Organics", category:"Herbs & Botanicals",   price:"$4.00",  stock:15, status:"Pending Review",added:"Dec 11, 2024" },
  { id:6, name:"Grass-Fed Beef",     farm:"Heritage Acres",   category:"Meat & Poultry",       price:"$18.00", stock:8,  status:"Active",        added:"Dec 1, 2024"  },
  { id:7, name:"Artisan Cheese",     farm:"Sunrise Organics", category:"Dairy & Eggs",         price:"$14.00", stock:12, status:"Pending Review",added:"Dec 11, 2024" },
  { id:8, name:"Wildflower Honey",   farm:"Blue Ridge Honey", category:"Other",                price:"$10.00", stock:0,  status:"Removed",       added:"Oct 20, 2024" },
];

const CATEGORIES = ["All Categories","Baked Goods","Dairy & Eggs","Fruits & Vegetables","Herbs & Botanicals","Meat & Poultry","Other"];
const FARMS      = ["All Farms","Example Farms","Blue Ridge Honey","Green Valley Farm","Sunrise Organics","Heritage Acres"];

const STATUS_STYLES: Record<ProdStatus, string> = {
  "Active":         "bg-green-100 text-green-700",
  "Pending Review": "bg-yellow-100 text-yellow-700",
  "Removed":        "bg-red-100 text-red-600",
};

export default function AdminProductsPage() {
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState("All Categories");
  const [farmFilter, setFarmFilter]   = useState("All Farms");
  const [statusFilter, setStatusFilter] = useState<"All" | ProdStatus>("All");

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "All Categories" || p.category === catFilter;
    const matchFarm   = farmFilter === "All Farms" || p.farm === farmFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchCat && matchFarm && matchStatus;
  });

  const counts = {
    Active:         ALL_PRODUCTS.filter(p => p.status === "Active").length,
    PendingReview:  ALL_PRODUCTS.filter(p => p.status === "Pending Review").length,
    Removed:        ALL_PRODUCTS.filter(p => p.status === "Removed").length,
  };

  const selectCls = "border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none bg-white";

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Manage Products</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Active",         value: counts.Active,        color:"text-green-700"  },
            { label:"Pending Review", value: counts.PendingReview, color:"text-yellow-600" },
            { label:"Removed",        value: counts.Removed,       color:"text-red-600"    },
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
            <div className="flex gap-1 flex-wrap">
              {(["All","Active","Pending Review","Removed"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${statusFilter === s ? "bg-[#1a4a2e] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className={selectCls}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={farmFilter} onChange={e => setFarmFilter(e.target.value)} className={selectCls}>
                {FARMS.map(f => <option key={f}>{f}</option>)}
              </select>
              <div className="relative">
                <input type="search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                  className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition w-44"/>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Image","Product","Farm","Category","Price","Stock","Status","Added","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.farm}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 tabular-nums">{p.price}</td>
                    <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.added}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.status === "Pending Review" && (
                          <button className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-2.5 py-1.5 rounded-lg transition-colors">Approve</button>
                        )}
                        <button className="text-xs font-semibold text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View</button>
                        {p.status !== "Removed" && (
                          <button className="text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
                        )}
                      </div>
                    </td>
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
