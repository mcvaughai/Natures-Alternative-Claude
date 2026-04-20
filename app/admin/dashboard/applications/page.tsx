"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

type AppStatus = "Pending" | "Approved" | "Rejected";
const FILTER_TABS: AppStatus[] = ["Pending", "Approved", "Rejected"];

interface Application {
  id: number; farm: string; owner: string; location: string;
  products: string; date: string; status: AppStatus; email: string; phone: string;
  fulfillment: string[]; description: string;
}

const ALL_APPS: Application[] = [
  { id:1, farm:"Green Valley Farm",    owner:"John Smith",    location:"Austin, TX",    products:"Fruits & Vegetables",        date:"Dec 10, 2024", status:"Pending",  email:"john@greenvalley.com",    phone:"(512) 555-0101", fulfillment:["Pickup","Local Delivery"], description:"We have been farming organically for 12 years, focusing on heirloom varieties and sustainable soil practices." },
  { id:2, farm:"Sunrise Organics",     owner:"Mary Johnson",  location:"Houston, TX",   products:"Dairy & Eggs, Herbs",        date:"Dec 11, 2024", status:"Pending",  email:"mary@sunrise.com",        phone:"(713) 555-0202", fulfillment:["Pickup"],                  description:"Small family dairy farm specializing in pasture-raised eggs and artisan cheeses." },
  { id:3, farm:"Heritage Acres",       owner:"Bob Wilson",    location:"Dallas, TX",    products:"Meat & Poultry",             date:"Dec 12, 2024", status:"Pending",  email:"bob@heritageacres.com",   phone:"(214) 555-0303", fulfillment:["Pickup","Shipping"],       description:"Heritage breed livestock farm with humane raising practices and no hormones or antibiotics." },
  { id:4, farm:"Example Farms",        owner:"Jane Farmer",   location:"Asheville, NC", products:"Mixed farm products",        date:"Nov 5, 2024",  status:"Approved", email:"jane@example.com",        phone:"(828) 555-0192", fulfillment:["Pickup","Local Delivery"], description:"General farm with diverse product range." },
  { id:5, farm:"Blue Ridge Honey",     owner:"Alice Turner",  location:"Raleigh, NC",   products:"Honey & Bee Products",       date:"Nov 8, 2024",  status:"Approved", email:"alice@blueridgehoney.com", phone:"(919) 555-0404", fulfillment:["Pickup","Shipping"],       description:"Artisan beekeeper producing raw unfiltered honey and beeswax products." },
  { id:6, farm:"Prairie Wind Produce", owner:"Carl Nguyen",   location:"Denver, CO",    products:"Fruits & Vegetables, Herbs", date:"Oct 20, 2024", status:"Rejected", email:"carl@prairiewind.com",    phone:"(720) 555-0505", fulfillment:["Pickup"],                  description:"Application did not meet minimum acreage requirements." },
];

const STATUS_STYLES: Record<AppStatus, string> = {
  Pending:  "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

export default function ApplicationsPage() {
  const [tab, setTab] = useState<"All" | AppStatus>("All");
  const [selected, setSelected] = useState<Application | null>(null);
  const [note, setNote] = useState("");

  const filtered = tab === "All" ? ALL_APPS : ALL_APPS.filter(a => a.status === tab);
  const counts = {
    All: ALL_APPS.length,
    Pending:  ALL_APPS.filter(a => a.status === "Pending").length,
    Approved: ALL_APPS.filter(a => a.status === "Approved").length,
    Rejected: ALL_APPS.filter(a => a.status === "Rejected").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Seller Applications</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:"Total",    value: counts.All,      color:"text-gray-900"   },
            { label:"Pending",  value: counts.Pending,  color:"text-yellow-600" },
            { label:"Approved", value: counts.Approved, color:"text-green-700"  },
            { label:"Rejected", value: counts.Rejected, color:"text-red-600"    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {(["All", ...FILTER_TABS] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-[#1a4a2e] text-[#1a4a2e]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {t} {t !== "All" && <span className="ml-1 text-xs">({counts[t]})</span>}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Farm Name","Owner","Location","Products","Applied","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{a.farm}</td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{a.owner}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{a.location}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">{a.products}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{a.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {a.status === "Pending" && (
                          <button onClick={() => { setSelected(selected?.id === a.id ? null : a); setNote(""); }}
                            className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                            Review
                          </button>
                        )}
                        {a.status === "Approved" && (
                          <>
                            <button className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors whitespace-nowrap">View Store</button>
                            <button className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Suspend</button>
                          </>
                        )}
                        {a.status === "Rejected" && (
                          <button onClick={() => { setSelected(selected?.id === a.id ? null : a); setNote(""); }}
                            className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Application Review — {selected.farm}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Farm Name</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.farm}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Owner</p>
                  <p className="text-sm text-gray-700">{selected.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{selected.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Contact</p>
                  <p className="text-sm text-gray-700">{selected.email}</p>
                  <p className="text-sm text-gray-700">{selected.phone}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Products</p>
                  <p className="text-sm text-gray-700">{selected.products}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Fulfillment Methods</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.fulfillment.map(f => (
                      <span key={f} className="text-xs bg-[#1a4a2e]/10 text-[#1a4a2e] px-2 py-0.5 rounded-full font-medium">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Farming Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
                </div>
                {/* Photo placeholders */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Farm Photos</p>
                  <div className="flex gap-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-20 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Admin Notes</label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add internal notes about this application..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition resize-none"/>
            </div>

            {selected.status === "Pending" && (
              <div className="flex gap-3">
                <button className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Approve Application
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Reject Application
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
