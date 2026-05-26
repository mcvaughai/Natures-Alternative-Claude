"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SellerLayout from "@/components/seller/SellerLayout";
import { getValidSellerSession, getAuthHeaders } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";

interface SellerData {
  id: string;
  farm_name: string;
  slug: string;
  status: string;
}

function StatCard({ label, value, sub, subColor = "text-gray-400", trend }: {
  label: string; value: string; sub: string; subColor?: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#1a4a2e] mb-1">{value}</p>
      <p className={`text-xs ${subColor}`}>{sub}</p>
      {trend && <p className="text-xs text-green-600 font-medium mt-0.5">↑ {trend}</p>}
    </div>
  );
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [seller, setSeller]             = useState<SellerData | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    getValidSellerSession().then(session => {
      if (!session) return;
      fetchData(session);
    });
  }, []);

  async function fetchData(session: { seller_id: string; farm_name: string; slug?: string; access_token: string }) {
    try {
      const headers = getAuthHeaders(session.access_token);

      const sellerRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?id=eq.${session.seller_id}&select=id,farm_name,slug,status`,
        { headers }
      );
      const sellers = await sellerRes.json();
      setSeller(sellers?.[0] ?? null);

      const productsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${session.seller_id}&status=eq.active&select=id`,
        { headers }
      );
      const products = await productsRes.json();
      setProductCount(Array.isArray(products) ? products.length : 0);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return null; // SellerLayout shows its own spinner

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {seller?.farm_name ?? "Seller"}! 🌿
          </h1>
          <p className="text-sm text-gray-400 mt-1">{today}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue"    value="$0.00"              sub="This month" />
          <StatCard label="Total Orders"     value="0"                  sub="This month" />
          <StatCard label="Active Products"  value={String(productCount)} sub="Listed" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-[#1a4a2e] mb-1">0</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs text-green-600 font-medium">All caught up</p>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <Link href="/seller/dashboard/orders" className="text-xs text-[#1a4a2e] font-semibold hover:underline">View All</Link>
          </div>
          <div className="text-center py-8 text-gray-400 text-sm">
            No orders yet. Share your store to get your first order!
          </div>
        </div>

        {/* Store performance + Top products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top products placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Your Products</h2>
              <Link href="/seller/dashboard/products" className="text-xs text-[#1a4a2e] font-semibold hover:underline">Manage</Link>
            </div>
            {productCount === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No active products yet.{" "}
                <Link href="/seller/dashboard/products" className="text-[#1a4a2e] font-semibold hover:underline">Add your first product</Link>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You have <span className="font-semibold text-[#1a4a2e]">{productCount}</span> active product{productCount !== 1 ? "s" : ""} listed.
              </p>
            )}
          </div>

          {/* Store performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Store Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Store Views",      value: "0",     sub: "this month"  },
                { label: "Conversion Rate",  value: "—",     sub: "of visitors" },
                { label: "Avg Order Value",  value: "—",     sub: "per order"   },
                { label: "Customer Rating",  value: "—",     sub: "avg rating"  },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-[#1a4a2e]">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Add New Product", href: "/seller/dashboard/products",    dark: true,  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> },
            { label: "Edit Store",      href: "/seller/dashboard/store-editor", dark: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg> },
            { label: "View Orders",     href: "/seller/dashboard/orders",       dark: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
            { label: "Analytics",       href: "/seller/dashboard/analytics",    dark: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
          ].map(action => (
            <button key={action.label} onClick={() => router.push(action.href)}
              className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl font-semibold text-sm transition-colors ${
                action.dark ? "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white shadow-sm" : "bg-white hover:shadow-md border border-gray-100 text-[#1a4a2e]"
              }`}>
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </SellerLayout>
  );
}
