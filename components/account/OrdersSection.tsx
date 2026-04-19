"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/explore/Pagination";

type OrderStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled" | "Ready for Pickup";

interface Order {
  id: string;
  date: string;
  farm: string;
  items: number;
  total: string;
  fulfillment: string;
  status: OrderStatus;
}

const ALL_ORDERS: Order[] = [
  { id: "NA-001", date: "Dec 12, 2024", farm: "Example Farms",     items: 3, total: "$23.40", fulfillment: "Pickup",          status: "Confirmed"       },
  { id: "NA-002", date: "Dec 10, 2024", farm: "Purple Food Crew",  items: 2, total: "$15.00", fulfillment: "Local Delivery",  status: "Pending"         },
  { id: "NA-003", date: "Dec 8, 2024",  farm: "W&W Farms",         items: 5, total: "$45.00", fulfillment: "Shipping",        status: "Completed"       },
  { id: "NA-004", date: "Dec 5, 2024",  farm: "Sunny Acres",       items: 1, total: "$8.75",  fulfillment: "Pickup",          status: "Cancelled"       },
  { id: "NA-005", date: "Dec 1, 2024",  farm: "Green Valley Farm", items: 4, total: "$32.00", fulfillment: "Pickup",          status: "Ready for Pickup"},
];

const FILTER_TABS = ["All Orders", "Pending", "Confirmed", "Completed", "Cancelled"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const STATUS_STYLES: Record<OrderStatus, string> = {
  Confirmed:        "bg-green-100 text-green-700",
  Pending:          "bg-yellow-100 text-yellow-700",
  Completed:        "bg-gray-100 text-gray-600",
  Cancelled:        "bg-red-100 text-red-600",
  "Ready for Pickup": "bg-blue-100 text-blue-700",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export default function OrdersSection() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All Orders");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = ALL_ORDERS.filter((o) => {
    const matchTab = activeTab === "All Orders" || o.status === activeTab;
    const matchSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.farm.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#1a4a2e] text-[#1a4a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <input
              type="search"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No orders found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Order #", "Date", "Farm", "Items", "Total", "Fulfillment", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">#{order.id}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{order.farm}</td>
                    <td className="px-4 py-3.5 text-gray-500">{order.items} items</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">{order.total}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{order.fulfillment}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => router.push(`/account/orders/${order.id}`)}
                        className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <Pagination totalPages={3} />
    </div>
  );
}
