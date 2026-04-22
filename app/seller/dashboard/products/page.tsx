"use client";

import { useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";

const CATEGORIES = ["Fruits & Vegetables","Meat & Poultry","Dairy & Eggs","Seafood","Baked Goods","Stone Ground Flour","Herbs & Botanicals","Natural Skincare","Candles & Home","Natural Cleaning","Other"];
const FILTER_TABS = ["All Products","Active","Draft","Out of Stock"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

interface Product {
  id: number; name: string; category: string; price: string;
  stock: number; status: "Active"|"Draft"|"Out of Stock";
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Pancakes Mix",      category: "Baked Goods",        price: "$6.00",  stock: 40,  status: "Active"      },
  { id: 2, name: "Fresh Eggs (12)",   category: "Dairy & Eggs",       price: "$8.00",  stock: 5,   status: "Active"      },
  { id: 3, name: "Raw Honey 16oz",    category: "Other",              price: "$12.00", stock: 22,  status: "Active"      },
  { id: 4, name: "Heritage Tomatoes", category: "Fruits & Vegetables",price: "$5.50",  stock: 0,   status: "Out of Stock"},
  { id: 5, name: "Herb Bundle",       category: "Herbs & Botanicals", price: "$4.00",  stock: 15,  status: "Draft"       },
  { id: 6, name: "Grass-Fed Beef",    category: "Meat & Poultry",     price: "$18.00", stock: 8,   status: "Active"      },
];

const STATUS_STYLES: Record<string, string> = {
  Active:          "bg-green-100 text-green-700",
  Draft:           "bg-gray-100 text-gray-600",
  "Out of Stock":  "bg-red-100 text-red-600",
};

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

export default function ProductsPage() {
  const [tab, setTab] = useState<FilterTab>("All Products");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const filtered = products.filter(p => {
    const matchTab = tab === "All Products" || p.status === tab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleStatus = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id
      ? { ...p, status: p.status === "Active" ? "Draft" : "Active" as Product["status"] }
      : p
    ));
  };
  const deleteProduct = (id: number) => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add New Product
          </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Add New Product</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                  <input type="text" placeholder="e.g. Fresh Strawberries" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select defaultValue="" className={inputCls + " appearance-none"}>
                      <option value="" disabled>Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" placeholder="0.00" min="0" step="0.01" className={inputCls + " pl-7"} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                  <input type="number" placeholder="0" min="0" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe your product..." className={inputCls + " resize-none"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#1a4a2e]/50 hover:bg-[#1a4a2e]/5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm text-gray-500">Click to upload product images</span>
                  <input type="file" accept="image/*" multiple className="hidden"/>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Save as Draft</button>
                <button className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">Publish Product</button>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs + search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            <div className="flex overflow-x-auto">
              {FILTER_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg mr-1 transition-colors ${tab === t ? "bg-[#1a4a2e] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <input type="search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
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
                  {["Image","Product","Category","Price","Stock","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 tabular-nums">{p.price}</td>
                    <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                        <button onClick={() => toggleStatus(p.id)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${p.status === "Active" ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
                          aria-label="Toggle status">
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${p.status === "Active" ? "translate-x-4" : "translate-x-0"}`}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
