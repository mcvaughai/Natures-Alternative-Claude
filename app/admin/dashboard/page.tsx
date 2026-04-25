"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

const PENDING_APPS = [
  { farm: "Green Valley Farm",  owner: "John Smith",    location: "Austin, TX",  date: "Dec 10, 2024" },
  { farm: "Sunrise Organics",   owner: "Mary Johnson",  location: "Houston, TX", date: "Dec 11, 2024" },
  { farm: "Heritage Acres",     owner: "Bob Wilson",    location: "Dallas, TX",  date: "Dec 12, 2024" },
];

const RECENT_ORDERS = [
  { id: "NA-101", customer: "John Doe",     farm: "Example Farms",   items: 3, total: "$23.40", status: "Completed", date: "Dec 12, 2024" },
  { id: "NA-102", customer: "Sarah Miller", farm: "Green Valley",    items: 2, total: "$15.00", status: "Confirmed", date: "Dec 12, 2024" },
  { id: "NA-103", customer: "Mike Ross",    farm: "Heritage Acres",  items: 5, total: "$45.00", status: "Pending",   date: "Dec 11, 2024" },
  { id: "NA-104", customer: "Lisa Kim",     farm: "Sunrise Organics",items: 1, total: "$8.00",  status: "Shipped",   date: "Dec 11, 2024" },
  { id: "NA-105", customer: "Tom Baker",    farm: "Example Farms",   items: 4, total: "$32.00", status: "Cancelled", date: "Dec 10, 2024" },
];

const TOP_FARMS = [
  { name: "Example Farms",    sales: "$4,200", orders: 52, rating: "4.9" },
  { name: "Green Valley Farm",sales: "$3,100", orders: 38, rating: "4.8" },
  { name: "Sunrise Organics", sales: "$2,800", orders: 31, rating: "4.7" },
  { name: "Heritage Acres",   sales: "$2,300", orders: 28, rating: "4.8" },
];

const STATUS_STYLES: Record<string, string> = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Shipped:   "bg-blue-100 text-blue-700",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-600",
};

function StatCard({ label, value, sub, color = "text-[#1a4a2e]", trend, urgent }: {
  label: string; value: string; sub: string; color?: string; trend?: string; urgent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
      <div className="flex items-center gap-1.5">
        {urgent && <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0"/>}
        <p className={`text-xs ${urgent ? "text-orange-500 font-medium" : "text-gray-400"}`}>{sub}</p>
      </div>
      {trend && <p className="text-xs text-green-600 font-medium mt-0.5">↑ {trend}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Belt-and-suspenders: verify admin session directly on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = "/admin/login";
    }, 3000);

    async function verifyAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        clearTimeout(timeout);
        window.location.href = "/admin/login";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      clearTimeout(timeout);
      if (profile?.role !== "admin") {
        window.location.href = "/admin/login";
      }
    }

    verifyAdmin().catch(() => {
      clearTimeout(timeout);
      window.location.href = "/admin/login";
    });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-1">{today}</p>
        </div>

        {/* Stats row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue"       value="$12,400.00" sub="All time"      trend="22% vs last quarter"/>
          <StatCard label="This Month Revenue"  value="$1,240.00"  sub="December 2024" trend="12% vs last month"/>
          <StatCard label="Total Orders"        value="124"        sub="All time"      trend="8% vs last quarter"/>
          <StatCard label="This Month Orders"   value="24"         sub="December 2024" trend="8% vs last month"/>
        </div>

        {/* Stats row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Sellers"       value="8"   sub="Approved farms"/>
          <StatCard label="Pending Applications" value="3"   sub="Awaiting review" color="text-orange-500" urgent/>
          <StatCard label="Total Customers"      value="156" sub="Registered users"/>
          <StatCard label="Total Products"       value="142" sub="Active listings"/>
        </div>

        {/* Pending Applications + Recent Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Pending Applications */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Pending Applications</h2>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              </div>
              <Link href="/admin/dashboard/applications" className="text-xs text-[#1a4a2e] font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {PENDING_APPS.map(a => (
                <div key={a.farm} className="flex items-center justify-between gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.farm}</p>
                    <p className="text-xs text-gray-500">{a.owner} · {a.location}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.date}</p>
                  </div>
                  <button onClick={() => router.push("/admin/dashboard/applications")}
                    className="shrink-0 text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3 py-1.5 rounded-lg transition-colors">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Recent Platform Orders</h2>
              <Link href="/admin/dashboard/analytics" className="text-xs text-[#1a4a2e] font-semibold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Order","Customer","Farm","Items","Total","Status"].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {RECENT_ORDERS.map(o => (
                    <tr key={o.id}>
                      <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">#{o.id}</td>
                      <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{o.customer}</td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{o.farm}</td>
                      <td className="py-3 pr-4 text-gray-500">{o.items}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-800 tabular-nums">{o.total}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Platform Health + Top Farms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Platform Health</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Avg Order Value",       value: "$23.40"  },
                { label: "Conversion Rate",        value: "4.2%"    },
                { label: "Active Listings",        value: "142"     },
                { label: "Customer Satisfaction",  value: "4.8 / 5" },
              ].map(s => (
                <div key={s.label} className="bg-[#f5f0e8] rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-[#1a4a2e]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Farms */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Top Performing Farms</h2>
            <div className="space-y-3">
              {TOP_FARMS.map((f, i) => (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.sales} · {f.orders} orders · ★ {f.rating}</p>
                  </div>
                  <Link href="/admin/dashboard/sellers" className="text-xs font-semibold text-[#1a4a2e] hover:underline shrink-0">View Store</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
