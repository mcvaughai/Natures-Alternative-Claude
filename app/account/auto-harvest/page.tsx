"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import AutoHarvestCard from "@/components/AutoHarvestCard";
import CreateAutoHarvestModal from "@/components/CreateAutoHarvestModal";

// ─── Mock data ────────────────────────────────────────────────────────────────

const ACTIVE_LISTS = [
  {
    id:                     "weekly-essentials",
    name:                   "Weekly Essentials",
    initialStatus:          "active" as const,
    frequency:              "Every 2 weeks",
    nextOrder:              "December 28, 2024",
    estimatedTotal:         "$45.20",
    itemCount:              7,
    extraItems:             3,
    farms:                  ["Example Farms", "Purple Food Crew"],
    substitutionPreference: "Substitute with similar item",
  },
  {
    id:                     "monthly-bulk",
    name:                   "Monthly Bulk Order",
    initialStatus:          "paused" as const,
    frequency:              "Every month",
    nextOrder:              "January 5, 2025",
    estimatedTotal:         "$120.00",
    itemCount:              12,
    extraItems:             8,
    farms:                  ["Heritage Acres", "Example Farms", "Blue Ridge Honey"],
    substitutionPreference: "Skip out of stock items",
  },
];

const UPCOMING_ORDERS = [
  { date: "Dec 28", list: "Weekly Essentials",  items: 7,  total: "$45.20",  status: "active"  as const },
  { date: "Jan 5",  list: "Monthly Bulk Order", items: 12, total: "$120.00", status: "paused"  as const },
  { date: "Jan 11", list: "Weekly Essentials",  items: 7,  total: "$45.20",  status: "active"  as const },
];

const ORDER_HISTORY = [
  { date: "Dec 14", list: "Weekly Essentials",  items: 7,  total: "$43.80",  status: "Completed" },
  { date: "Nov 30", list: "Weekly Essentials",  items: 6,  total: "$38.50",  status: "Completed" },
  { date: "Nov 5",  list: "Monthly Bulk Order", items: 12, total: "$115.00", status: "Completed" },
];

// ─── How It Works step ───────────────────────────────────────────────────────

function HowItWorksStep({
  icon, step, title, desc,
}: { icon: string; step: number; title: string; desc: string }) {
  return (
    <div className="flex-1 flex flex-col items-center text-center px-4">
      <div className="w-12 h-12 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center text-2xl mb-3">
        {icon}
      </div>
      <p className="text-xs font-semibold text-[#1a4a2e] uppercase tracking-wide mb-1">
        Step {step}
      </p>
      <p className="text-sm font-bold text-gray-800 mb-1">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AutoHarvestPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [hasLists] = useState(true); // set to false to see empty state

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || !JSON.parse(stored).loggedIn) {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

            {/* Sidebar */}
            <AccountSidebar />

            {/* Content */}
            <div className="space-y-6">

              {/* Page header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-2xl">🌾</span>
                    <h2 className="text-xl font-bold text-[#1a4a2e]">Auto Harvest</h2>
                  </div>
                  <p className="text-sm text-gray-500 max-w-lg">
                    Set up automatic recurring orders so your favorite farm products are always stocked
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Auto Harvest List
                </button>
              </div>

              {/* How It Works */}
              <div className="bg-white border border-[#1a4a2e]/10 rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5 text-center">
                  How It Works
                </p>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-0 sm:divide-x divide-gray-100">
                  <HowItWorksStep icon="📝" step={1} title="Build Your List"   desc="Add your favorite products and set quantities" />
                  <HowItWorksStep icon="⏰" step={2} title="Set Your Schedule" desc="Choose how often you want your order placed" />
                  <HowItWorksStep icon="🌾" step={3} title="Auto Harvest"      desc="Your order is placed automatically on schedule" />
                </div>
              </div>

              {/* Empty state */}
              {!hasLists && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Auto Harvest Lists Yet</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Set up your first recurring order and never run out of your favorite farm products again
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                  >
                    Create Your First List
                  </button>
                </div>
              )}

              {/* Active Lists */}
              {hasLists && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Your Active Lists</h3>
                  <div className="space-y-4">
                    {ACTIVE_LISTS.map((list, i) => (
                      <div key={list.id}>
                        <AutoHarvestCard {...list} />
                        {i < ACTIVE_LISTS.length - 1 && (
                          <div className="h-px bg-gray-100 my-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Orders */}
              {hasLists && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Upcoming Auto Harvest Orders</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      {UPCOMING_ORDERS.map((order, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors flex-wrap"
                        >
                          {/* Date */}
                          <div className="w-14 shrink-0">
                            <p className="text-sm font-bold text-gray-800">{order.date}</p>
                          </div>
                          {/* List name */}
                          <p className="flex-1 text-sm font-medium text-gray-700 min-w-[120px]">
                            {order.list}
                          </p>
                          {/* Items + total */}
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{order.items} items</span>
                            <span className="text-gray-300">·</span>
                            <span className="font-semibold text-gray-700">{order.total}</span>
                          </div>
                          {/* Status badge */}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                            order.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status === "active" ? "Active" : "Paused"}
                          </span>
                          {/* Action button */}
                          {order.status === "active" ? (
                            <button className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                              Skip
                            </button>
                          ) : (
                            <button className="text-xs font-semibold border border-[#1a4a2e] text-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors shrink-0">
                              Activate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                      <p className="text-xs text-gray-400">
                        You will be notified 3 days before each order is placed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order History */}
              {hasLists && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Auto Harvest Order History</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {["Date", "List Name", "Items", "Total", "Status", "Action"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {ORDER_HISTORY.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{row.date}</td>
                              <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{row.list}</td>
                              <td className="px-5 py-3.5 text-gray-600">{row.items} items</td>
                              <td className="px-5 py-3.5 font-semibold text-gray-800 tabular-nums">{row.total}</td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <button className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                  View Order
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && <CreateAutoHarvestModal onClose={() => setShowModal(false)} />}

      <Footer />
    </div>
  );
}
