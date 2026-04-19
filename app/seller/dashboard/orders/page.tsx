"use client";

import { useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";

type OrderStatus = "Pending"|"Confirmed"|"Ready"|"Completed"|"Cancelled";

interface Order {
  id: string; date: string; customer: string; email: string; items: number;
  total: string; fulfillment: string; status: OrderStatus;
  itemList: string[];
}

const ALL_ORDERS: Order[] = [
  { id:"NA-001", date:"Dec 12, 2024", customer:"John Doe",    email:"john@email.com",  items:3, total:"$23.40", fulfillment:"Pickup",         status:"Pending",   itemList:["Pancakes Mix x2","Fresh Eggs x1"] },
  { id:"NA-002", date:"Dec 11, 2024", customer:"Sarah Miller",email:"sarah@email.com", items:2, total:"$15.00", fulfillment:"Local Delivery",  status:"Confirmed", itemList:["Raw Honey x1","Herb Bundle x1"] },
  { id:"NA-003", date:"Dec 10, 2024", customer:"Mike Ross",   email:"mike@email.com",  items:5, total:"$45.00", fulfillment:"Shipping",        status:"Ready",     itemList:["Grass-Fed Beef x2","Heritage Tomatoes x3"] },
  { id:"NA-004", date:"Dec 9, 2024",  customer:"Lisa Kim",    email:"lisa@email.com",  items:1, total:"$8.00",  fulfillment:"Pickup",          status:"Completed", itemList:["Fresh Eggs x1"] },
  { id:"NA-005", date:"Dec 8, 2024",  customer:"Tom Baker",   email:"tom@email.com",   items:4, total:"$32.00", fulfillment:"Local Delivery",  status:"Cancelled", itemList:["Pancakes Mix x4"] },
  { id:"NA-006", date:"Dec 7, 2024",  customer:"Amy Chen",    email:"amy@email.com",   items:2, total:"$18.00", fulfillment:"Pickup",          status:"Confirmed", itemList:["Raw Honey x2"] },
];

const STATUS_STYLES: Record<string,string> = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Ready:     "bg-blue-100 text-blue-700",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-600",
};
const FILTER_TABS = ["All","Pending","Confirmed","Ready","Completed","Cancelled"] as const;

export default function SellerOrdersPage() {
  const [tab, setTab] = useState<string>("All");
  const [selected, setSelected] = useState<Order|null>(null);
  const [note, setNote] = useState("");

  const counts = {
    all: ALL_ORDERS.length,
    Pending:   ALL_ORDERS.filter(o=>o.status==="Pending").length,
    Confirmed: ALL_ORDERS.filter(o=>o.status==="Confirmed").length,
    Completed: ALL_ORDERS.filter(o=>o.status==="Completed").length,
  };

  const filtered = ALL_ORDERS.filter(o => tab === "All" || o.status === tab);

  const getActionLabel = (status: OrderStatus) => {
    if (status === "Pending")   return { label: "Confirm Order", cls: "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white" };
    if (status === "Confirmed") return { label: "Mark as Ready", cls: "bg-blue-600 hover:bg-blue-700 text-white" };
    if (status === "Ready")     return { label: "Mark Complete", cls: "bg-gray-700 hover:bg-gray-800 text-white" };
    return { label: "View Details", cls: "border border-gray-300 text-gray-600 hover:bg-gray-50" };
  };

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:"All Orders",    value: counts.all,       color:"text-gray-900"  },
            { label:"Pending",       value: counts.Pending,   color:"text-yellow-600"},
            { label:"Confirmed",     value: counts.Confirmed, color:"text-green-700" },
            { label:"Completed",     value: counts.Completed, color:"text-gray-600"  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table + filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {FILTER_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-[#1a4a2e] text-[#1a4a2e]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Order #","Date","Customer","Items","Total","Fulfillment","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(o => {
                  const { label, cls } = getActionLabel(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">#{o.id}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{o.customer}</td>
                      <td className="px-4 py-3.5 text-gray-500">{o.items} items</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">{o.total}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{o.fulfillment}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => setSelected(selected?.id === o.id ? null : o)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${cls}`}>
                          {label}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order detail panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Order #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Customer</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.customer}</p>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Fulfillment</p>
                  <p className="text-sm text-gray-700">{selected.fulfillment}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Items Ordered</p>
                  <ul className="space-y-1">
                    {selected.itemList.map(item => (
                      <li key={item} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1a4a2e] shrink-0"/>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-bold text-[#1a4a2e] mt-2">Total: {selected.total}</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* Order timeline */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Order Timeline</p>
                  <ol className="space-y-2">
                    {(["Pending","Confirmed","Ready","Completed"] as OrderStatus[]).map((step, i) => {
                      const steps: OrderStatus[] = ["Pending","Confirmed","Ready","Completed"];
                      const currentIdx = steps.indexOf(selected.status);
                      const done = i <= currentIdx;
                      return (
                        <li key={step} className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#1a4a2e]" : "bg-gray-200"}`}>
                            {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5"/></svg>}
                          </div>
                          <span className={`text-sm ${done ? "text-gray-800 font-medium" : "text-gray-400"}`}>{step}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                {/* Seller note */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Add a Note</label>
                  <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for this order..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition resize-none"/>
                  <button className="mt-2 text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-4 py-1.5 rounded-lg transition-colors">Save Note</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
