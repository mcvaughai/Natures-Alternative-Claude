"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutSeller } from "@/lib/logout";
import { getSellerSession } from "@/lib/sessionHelper";
import {
  IconHome,
  IconShoppingBag,
  IconTruckDelivery,
  IconPackage,
  IconStack2,
  IconCalendar,
  IconUsers,
  IconRepeat,
  IconBuildingStore,
  IconPencil,
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: boolean;
}

interface NavGroup {
  section: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    section: null,
    items: [
      { label: "Today",       href: "/seller/dashboard",             icon: <IconHome size={15} stroke={1.5} /> },
    ],
  },
  {
    section: "DAILY",
    items: [
      { label: "Orders",      href: "/seller/dashboard/orders",      icon: <IconShoppingBag size={15} stroke={1.5} />, badge: true },
      { label: "Fulfillment", href: "/seller/dashboard/fulfillment", icon: <IconTruckDelivery size={15} stroke={1.5} /> },
    ],
  },
  {
    section: "CATALOG",
    items: [
      { label: "Products",         href: "/seller/dashboard/products",  icon: <IconPackage size={15} stroke={1.5} /> },
      { label: "Inventory",        href: "/seller/dashboard/inventory", icon: <IconStack2 size={15} stroke={1.5} /> },
      { label: "Harvests & Drops", href: "/seller/dashboard/harvests",  icon: <IconCalendar size={15} stroke={1.5} /> },
    ],
  },
  {
    section: "CUSTOMERS",
    items: [
      { label: "Customers",     href: "/seller/dashboard/customers",     icon: <IconUsers size={15} stroke={1.5} /> },
      { label: "Subscriptions", href: "/seller/dashboard/subscriptions", icon: <IconRepeat size={15} stroke={1.5} /> },
    ],
  },
  {
    section: "BUSINESS",
    items: [
      { label: "Storefront", href: "/seller/dashboard/store-editor", icon: <IconBuildingStore size={15} stroke={1.5} /> },
      { label: "Blog",       href: "/seller/dashboard/blog",         icon: <IconPencil size={15} stroke={1.5} /> },
      { label: "Analytics",  href: "/seller/dashboard/analytics",    icon: <IconChartBar size={15} stroke={1.5} /> },
      { label: "Settings",   href: "/seller/dashboard/settings",     icon: <IconSettings size={15} stroke={1.5} /> },
    ],
  },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const [farmName, setFarmName] = useState("My Farm");
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const session = getSellerSession();
    if (session?.farm_name) setFarmName(session.farm_name);
  }, []);

  useEffect(() => {
    const checkPendingOrders = async () => {
      try {
        const session = getSellerSession();
        if (!session) return;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/orders?seller_id=eq.${session.seller_id}&status=eq.pending&select=id`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) setPendingOrders(data.length);
      } catch (err) {
        console.error("Error checking pending orders:", err);
      }
    };

    checkPendingOrders();
    const interval = setInterval(checkPendingOrders, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-56 flex flex-col shrink-0" style={{ backgroundColor: "#053D2D" }}>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {/* Section label */}
            {group.section && (
              <p
                className="uppercase font-semibold"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.35)",
                  padding: "12px 16px 4px",
                }}
              >
                {group.section}
              </p>
            )}

            {/* Items */}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 pl-3 pr-3 py-2.5 text-sm transition-colors"
                      style={{
                        backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                        color: active ? "#ffffff" : "rgba(255,255,255,0.7)",
                        fontWeight: active ? 500 : 400,
                        borderLeft: active ? "3px solid #ffffff" : "3px solid transparent",
                        borderRadius: active ? "0 6px 6px 0" : "0 6px 6px 0",
                      }}
                    >
                      <span style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.7)", display: "flex", alignItems: "center" }}>
                        {item.icon}
                      </span>
                      {item.label}
                      {item.badge && pendingOrders > 0 && (
                        <span
                          className="ml-auto text-xs text-white font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#dc2626" }}
                        >
                          {pendingOrders}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: avatar + farm name + marketplace + logout */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Farm identity row */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div
            className="shrink-0 flex items-center justify-center text-white font-semibold"
            style={{
              width: 28, height: 28, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              fontSize: 12,
            }}
          >
            {farmName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white truncate leading-tight" style={{ fontSize: 12 }}>{farmName}</p>
            <Link
              href="/"
              className="truncate leading-tight hover:underline transition-colors"
              style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}
            >
              Visit Marketplace
            </Link>
          </div>
        </div>
        {/* Logout */}
        <button
          onClick={logoutSeller}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ color: "rgba(255,100,100,0.8)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
