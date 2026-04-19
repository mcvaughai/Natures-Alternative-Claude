"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#1a4a2e]/10 flex items-center justify-center text-[#1a4a2e] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1a4a2e] leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Confirmed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Completed: "bg-gray-100 text-gray-600",
    Cancelled: "bg-red-100 text-red-600",
    "Ready for Pickup": "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const RECENT_ORDERS = [
  { id: "NA-001", date: "Dec 12, 2024", farm: "Example Farms",     items: 3, total: "$23.40", status: "Confirmed",  action: "Track"   },
  { id: "NA-002", date: "Dec 10, 2024", farm: "Purple Food Crew",  items: 2, total: "$15.00", status: "Pending",    action: "Track"   },
  { id: "NA-003", date: "Dec 8, 2024",  farm: "W&W Farms",         items: 5, total: "$45.00", status: "Completed",  action: "Reorder" },
];

const NEARBY_FARMS = [
  { id: 1, name: "Example Farms",     distance: "2.3 miles away" },
  { id: 2, name: "Green Valley Farm", distance: "4.1 miles away" },
  { id: 3, name: "Sunny Acres",       distance: "6.8 miles away" },
];

const RECENT_PRODUCTS = [
  { id: 20, name: "Product", description: "Lorem ipsum dolor sit amet.", price: "$4.99" },
  { id: 21, name: "Product", description: "Lorem ipsum dolor sit amet.", price: "$7.50" },
  { id: 22, name: "Product", description: "Lorem ipsum dolor sit amet.", price: "$3.25" },
  { id: 23, name: "Product", description: "Lorem ipsum dolor sit amet.", price: "$9.99" },
];

export default function DashboardSection() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("there");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        // Use just the first name for the greeting
        setFirstName(user.name?.split(" ")[0] ?? "there");
      }
    } catch {
      // keep default
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-[#1a4a2e] mb-1">Welcome back, {firstName}!</h2>
        <p className="text-sm text-gray-500">Here is a summary of your account activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={12}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Pending Orders"
          value={2}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Saved Items"
          value={8}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          }
        />
        <StatCard
          label="Farms Followed"
          value={3}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-[#1a4a2e] font-semibold hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Order #", "Date", "Farm", "Items", "Total", "Status", ""].map((h) => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">#{order.id}</td>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{order.date}</td>
                  <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{order.farm}</td>
                  <td className="py-3 pr-4 text-gray-500">{order.items} items</td>
                  <td className="py-3 pr-4 font-semibold text-gray-800 tabular-nums">{order.total}</td>
                  <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3">
                    <button
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                      className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors whitespace-nowrap"
                    >
                      {order.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nearby farms */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Farms Near You</h2>
          <Link href="/explore" className="text-xs text-[#1a4a2e] font-semibold hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NEARBY_FARMS.map((farm) => (
            <div key={farm.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
              <div className="bg-gray-200 h-28 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-800">{farm.name}</p>
                <p className="text-xs text-[#1a4a2e] font-medium mt-0.5">{farm.distance}</p>
                <button
                  onClick={() => router.push(`/store/${farm.id}`)}
                  className="mt-2.5 w-full text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white py-1.5 rounded-lg transition-colors"
                >
                  Visit Store
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently viewed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Recently Viewed</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {RECENT_PRODUCTS.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
