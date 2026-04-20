"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

type CustStatus = "Active" | "Suspended";

interface Customer {
  id: number; name: string; email: string; location: string;
  orders: number; spent: string; joined: string; status: CustStatus;
}

const ALL_CUSTOMERS: Customer[] = [
  { id:1,  name:"John Doe",       email:"john@email.com",    location:"Asheville, NC", orders:8,  spent:"$187.20", joined:"Oct 2, 2024",  status:"Active"    },
  { id:2,  name:"Sarah Miller",   email:"sarah@email.com",   location:"Austin, TX",    orders:5,  spent:"$75.00",  joined:"Oct 15, 2024", status:"Active"    },
  { id:3,  name:"Mike Ross",      email:"mike@email.com",    location:"Houston, TX",   orders:12, spent:"$540.00", joined:"Sep 18, 2024", status:"Active"    },
  { id:4,  name:"Lisa Kim",       email:"lisa@email.com",    location:"Dallas, TX",    orders:3,  spent:"$24.00",  joined:"Nov 1, 2024",  status:"Active"    },
  { id:5,  name:"Tom Baker",      email:"tom@email.com",     location:"Denver, CO",    orders:0,  spent:"$0.00",   joined:"Dec 5, 2024",  status:"Suspended" },
  { id:6,  name:"Amy Chen",       email:"amy@email.com",     location:"Raleigh, NC",   orders:7,  spent:"$126.00", joined:"Oct 28, 2024", status:"Active"    },
  { id:7,  name:"James Carter",   email:"james@email.com",   location:"Nashville, TN", orders:4,  spent:"$92.50",  joined:"Nov 10, 2024", status:"Active"    },
  { id:8,  name:"Emma Watson",    email:"emma@email.com",    location:"Portland, OR",  orders:6,  spent:"$144.00", joined:"Oct 5, 2024",  status:"Active"    },
];

const STATUS_STYLES: Record<CustStatus, string> = {
  Active:    "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-600",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = ALL_CUSTOMERS.filter(c =>
    !search
    || c.name.toLowerCase().includes(search.toLowerCase())
    || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    Total:        ALL_CUSTOMERS.length,
    Active:       ALL_CUSTOMERS.filter(c => c.status === "Active").length,
    NewThisMonth: ALL_CUSTOMERS.filter(c => c.joined.includes("Dec")).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900">Manage Customers</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Total Customers",   value: counts.Total,        color:"text-gray-900"  },
            { label:"Active",            value: counts.Active,       color:"text-green-700" },
            { label:"New This Month",    value: counts.NewThisMonth, color:"text-[#1a4a2e]" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative ml-auto">
              <input type="search" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition w-64"/>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/>
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name","Email","Location","Orders","Total Spent","Joined","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center text-[#1a4a2e] text-xs font-bold shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{c.email}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{c.location}</td>
                    <td className="px-4 py-3.5 text-gray-700">{c.orders}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">{c.spent}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{c.joined}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-2.5 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors">View</button>
                        <button className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${c.status === "Active" ? "text-orange-600 border border-orange-200 hover:bg-orange-50" : "text-green-600 border border-green-200 hover:bg-green-50"}`}>
                          {c.status === "Active" ? "Suspend" : "Reactivate"}
                        </button>
                        <button className="text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
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
