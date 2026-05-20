"use client";

import React, { useState, useEffect, useCallback } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { SUPABASE_URL, supabaseHeaders } from "@/lib/api";
import { getValidSellerSession, getAuthHeaders } from "@/lib/sessionHelper";

const FILTER_TABS = ["All", "Low Stock", "Out of Stock", "In Stock", "Seasonal"] as const;
type FilterTab = typeof FILTER_TABS[number];

interface InventoryProduct {
  id: string;
  name: string;
  price: number;
  stock_qty: number | null;
  unit: string | null;
  in_stock: boolean;
  status: string;
  images: string[];
  pricing_type?: string;
  price_per_pound?: number | null;
  low_stock_threshold?: number | null;
  is_seasonal?: boolean;
  restock_notes?: string | null;
  categories: { name: string } | null;
  primaryImage?: string | null;
}

interface ProductUnit {
  id: string;
  product_id: string;
  seller_id: string;
  weight_lbs: number;
  price: number;
  status: string;
}

interface RestockEntry {
  id: string;
  product_id: string;
  product_name: string;
  qty_added: number;
  note: string;
  created_at: string;
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function getStockStatus(p: InventoryProduct): "out" | "low" | "ok" {
  if (!p.in_stock || p.stock_qty === 0) return "out";
  const threshold = p.low_stock_threshold ?? 5;
  if (p.stock_qty !== null && p.stock_qty <= threshold) return "low";
  return "ok";
}

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  out: { label: "Out of Stock",  cls: "bg-red-100 text-red-600" },
  low: { label: "Low Stock",     cls: "bg-amber-100 text-amber-700" },
  ok:  { label: "In Stock",      cls: "bg-green-100 text-green-700" },
};

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

export default function InventoryPage() {
  const [tab, setTab]           = useState<FilterTab>("All");
  const [search, setSearch]     = useState("");
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Selected product settings panel
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [restockQty, setRestockQty]         = useState("");
  const [restockNote, setRestockNote]       = useState("");
  const [savingRestock, setSavingRestock]   = useState(false);

  // Per-product settings
  const [threshold, setThreshold]       = useState("");
  const [isSeasonal, setIsSeasonal]     = useState(false);
  const [restockNotes, setRestockNotes] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Unit management
  const [productUnits, setProductUnits]     = useState<{ [key: string]: ProductUnit[] }>({});
  const [loadingUnits, setLoadingUnits]     = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [newUnitWeight, setNewUnitWeight]   = useState<{ [key: string]: string }>({});
  const [addingUnit, setAddingUnit]         = useState<string | null>(null);

  // Restock history (last 20, stored locally)
  const [history, setHistory] = useState<RestockEntry[]>([]);

  // Summary stats
  const outOfStock  = products.filter(p => getStockStatus(p) === "out").length;
  const lowStock    = products.filter(p => getStockStatus(p) === "low").length;
  const totalActive = products.filter(p => p.status === "active").length;

  const fetchProducts = useCallback(async (sid: string) => {
    try {
      const session = await getValidSellerSession();
      const headers = session?.access_token ? getAuthHeaders(session.access_token) : supabaseHeaders;

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${sid}&select=id,name,price,stock_qty,unit,in_stock,status,images,pricing_type,price_per_pound,low_stock_threshold,is_seasonal,restock_notes,categories(name)&order=name.asc`,
        { headers }
      );
      if (!res.ok) return;
      const raw: InventoryProduct[] = (await res.json()) ?? [];

      if (raw.length > 0) {
        const ids = raw.map(p => p.id).join(",");
        const imgRes = await fetch(
          `${SUPABASE_URL}/rest/v1/product_images?product_id=in.(${ids})&select=product_id,url,is_primary&order=display_order.asc`,
          { headers }
        );
        const imageRows: { product_id: string; url: string; is_primary: boolean }[] =
          imgRes.ok ? (await imgRes.json() ?? []) : [];
        const imageMap = new Map<string, string>();
        for (const row of imageRows) {
          if (!imageMap.has(row.product_id) || row.is_primary) imageMap.set(row.product_id, row.url);
        }
        setProducts(raw.map(p => ({ ...p, primaryImage: imageMap.get(p.id) ?? p.images?.[0] ?? null })));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const session = await getValidSellerSession();
        if (!session?.access_token) { window.location.href = "/seller/login"; return; }
        setSellerId(session.seller_id);
        await fetchProducts(session.seller_id);
      } catch (err) {
        console.error("Inventory init error:", err);
        window.location.href = "/seller/login";
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fetchProducts]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("restock_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    setThreshold(selectedProduct.low_stock_threshold?.toString() ?? "5");
    setIsSeasonal(selectedProduct.is_seasonal ?? false);
    setRestockNotes(selectedProduct.restock_notes ?? "");
    setRestockQty("");
    setRestockNote("");
  }, [selectedProduct]);

  // ── Update product stock_qty helper ──────────────────────────────────────
  const updateStock = async (productId: string, newQty: number) => {
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      const authHeaders = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };
      await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ stock_qty: newQty, in_stock: newQty > 0, updated_at: new Date().toISOString() }),
        }
      );
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, stock_qty: newQty, in_stock: newQty > 0 } : p
      ));
      if (selectedProduct?.id === productId) {
        setSelectedProduct(prev => prev ? { ...prev, stock_qty: newQty, in_stock: newQty > 0 } : null);
      }
    } catch (err) {
      console.error("updateStock error:", err);
    }
  };

  // ── Fetch units for a product ─────────────────────────────────────────────
  const fetchProductUnits = async (productId: string) => {
    setLoadingUnits(productId);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/product_units?product_id=eq.${productId}&status=eq.available&select=*&order=weight_lbs.asc`,
        { headers: getAuthHeaders(session.access_token) }
      );
      const data = await res.json();
      setProductUnits(prev => ({
        ...prev,
        [productId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Error fetching units:", err);
    } finally {
      setLoadingUnits(null);
    }
  };

  // ── Add a new unit ────────────────────────────────────────────────────────
  const addProductUnit = async (productId: string, weightLbs: number, pricePerPound: number) => {
    setAddingUnit(productId);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      const price = parseFloat((pricePerPound * weightLbs).toFixed(2));
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/product_units`,
        {
          method: "POST",
          headers: { ...getAuthHeaders(session.access_token), "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({
            product_id: productId,
            seller_id:  session.seller_id,
            weight_lbs: weightLbs,
            price,
            status: "available",
          }),
        }
      );
      if (res.ok) {
        const newUnits: ProductUnit[] = await res.json();
        const newUnit = newUnits[0];
        const updated = [...(productUnits[productId] || []), newUnit].sort((a, b) => a.weight_lbs - b.weight_lbs);
        setProductUnits(prev => ({ ...prev, [productId]: updated }));
        setNewUnitWeight(prev => ({ ...prev, [productId]: "" }));
        await updateStock(productId, updated.length);
        setSuccessMessage("Unit added!");
        setTimeout(() => setSuccessMessage(""), 2500);
      } else {
        const err = await res.text();
        alert("Error adding unit: " + err);
      }
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAddingUnit(null);
    }
  };

  // ── Remove / mark unit as sold ────────────────────────────────────────────
  const removeProductUnit = async (unitId: string, productId: string) => {
    if (!confirm("Remove this unit? This cannot be undone.")) return;
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      await fetch(
        `${SUPABASE_URL}/rest/v1/product_units?id=eq.${unitId}`,
        {
          method: "PATCH",
          headers: { ...getAuthHeaders(session.access_token), "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sold" }),
        }
      );
      const remaining = (productUnits[productId] || []).filter(u => u.id !== unitId);
      setProductUnits(prev => ({ ...prev, [productId]: remaining }));
      await updateStock(productId, remaining.length);
      setSuccessMessage("Unit removed!");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // ── Restock: add stock_qty (for non-per_pound products) ──────────────────
  const handleRestock = async () => {
    if (!selectedProduct || !restockQty || parseInt(restockQty) <= 0) {
      alert("Enter a valid quantity to add.");
      return;
    }
    setSavingRestock(true);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      const currentQty = selectedProduct.stock_qty ?? 0;
      const newQty = currentQty + parseInt(restockQty);
      await updateStock(selectedProduct.id, newQty);

      const entry: RestockEntry = {
        id: Date.now().toString(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        qty_added: parseInt(restockQty),
        note: restockNote,
        created_at: new Date().toISOString(),
      };
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      try { localStorage.setItem("restock_history", JSON.stringify(newHistory)); } catch { /* ignore */ }
      setRestockQty("");
      setRestockNote("");
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingRestock(false);
    }
  };

  // ── Save per-product settings ─────────────────────────────────────────────
  const handleSaveSettings = async () => {
    if (!selectedProduct) return;
    setSavingSettings(true);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      const authHeaders = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${selectedProduct.id}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            low_stock_threshold: threshold ? parseInt(threshold) : null,
            is_seasonal: isSeasonal,
            restock_notes: restockNotes.trim() || null,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!res.ok) { alert("Error saving settings: " + await res.text()); return; }
      if (sellerId) await fetchProducts(sellerId);
      setSuccessMessage("Settings saved!");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Inline stock edit (non-per_pound) ─────────────────────────────────────
  const handleInlineStockUpdate = async (productId: string, newQty: number) => {
    await updateStock(productId, newQty);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const st = getStockStatus(p);
    const matchTab =
      tab === "All"          ? true :
      tab === "Low Stock"    ? st === "low" :
      tab === "Out of Stock" ? st === "out" :
      tab === "In Stock"     ? st === "ok" :
      tab === "Seasonal"     ? !!p.is_seasonal :
      true;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-6xl">

        {/* Success toast */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#1a4a2e] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage stock levels, individual units, and product settings</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
            <p className="text-sm text-gray-500 mt-0.5">Active Products</p>
          </div>
          <div className={`bg-white rounded-2xl border shadow-sm p-4 ${lowStock > 0 ? "border-amber-200" : "border-gray-100"}`}>
            <p className={`text-2xl font-bold ${lowStock > 0 ? "text-amber-600" : "text-gray-900"}`}>{lowStock}</p>
            <p className="text-sm text-gray-500 mt-0.5">Low Stock</p>
          </div>
          <div className={`bg-white rounded-2xl border shadow-sm p-4 ${outOfStock > 0 ? "border-red-200" : "border-gray-100"}`}>
            <p className={`text-2xl font-bold ${outOfStock > 0 ? "text-red-600" : "text-gray-900"}`}>{outOfStock}</p>
            <p className="text-sm text-gray-500 mt-0.5">Out of Stock</p>
          </div>
        </div>

        <div className="flex gap-5 items-start">

          {/* ── Main inventory table ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tabs + search */}
              <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
                <div className="flex overflow-x-auto">
                  {FILTER_TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg mr-1 transition-colors ${tab === t ? "bg-[#1a4a2e] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="relative ml-auto">
                  <input type="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition w-44" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">No products found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["", "Product", "Pricing", "Stock", "Status", "Actions"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => {
                        const st = getStockStatus(p);
                        const chip = STATUS_CHIP[st];
                        const isSelected = selectedProduct?.id === p.id;
                        const isExpanded = expandedProduct === p.id;
                        const units = productUnits[p.id] || [];
                        const pricePerPound = p.price_per_pound ?? 0;

                        return (
                          <React.Fragment key={p.id}>
                            {/* ── Main product row ── */}
                            <tr className={`border-b border-gray-50 transition-colors ${isSelected ? "bg-green-50/60" : "hover:bg-gray-50/50"}`}>
                              {/* Thumbnail */}
                              <td className="px-4 py-3">
                                {(p.primaryImage || p.images?.[0]) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.primaryImage || p.images[0]} alt={p.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </td>
                              {/* Name + category */}
                              <td className="px-4 py-3">
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{p.categories?.name ?? "No category"}</p>
                              </td>
                              {/* Pricing */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {p.pricing_type === "per_pound" ? (
                                  <div>
                                    <span className="font-semibold text-[#1a4a2e]">${Number(pricePerPound).toFixed(2)}</span>
                                    <span className="text-gray-400 text-xs">/lb</span>
                                    <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 bg-[#1a4a2e]/10 text-[#1a4a2e] rounded-full">PER LB</span>
                                  </div>
                                ) : (
                                  <span className="font-semibold text-gray-800">${Number(p.price).toFixed(2)}</span>
                                )}
                                {p.is_seasonal && (
                                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full">SEASONAL</span>
                                )}
                              </td>
                              {/* Stock — inline editor for fixed; unit count display for per_pound */}
                              <td className="px-4 py-3">
                                {p.pricing_type === "per_pound" ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-gray-800">{p.stock_qty ?? 0}</span>
                                    <span className="text-xs text-gray-400">units</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleInlineStockUpdate(p.id, Math.max(0, (p.stock_qty ?? 0) - 1))}
                                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold leading-none transition-colors">−</button>
                                    <input type="number" min={0} value={p.stock_qty ?? 0}
                                      onChange={e => {
                                        const v = parseInt(e.target.value);
                                        if (!isNaN(v) && v >= 0) handleInlineStockUpdate(p.id, v);
                                      }}
                                      className="w-14 text-center border border-gray-200 rounded-lg py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#1a4a2e]" />
                                    <button onClick={() => handleInlineStockUpdate(p.id, (p.stock_qty ?? 0) + 1)}
                                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold leading-none transition-colors">+</button>
                                    <span className="text-xs text-gray-400">{p.unit ?? ""}</span>
                                  </div>
                                )}
                              </td>
                              {/* Status */}
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chip.cls}`}>
                                  {chip.label}
                                </span>
                              </td>
                              {/* Actions */}
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setSelectedProduct(isSelected ? null : p)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                    isSelected ? "bg-[#1a4a2e] text-white border-[#1a4a2e]" : "text-[#1a4a2e] border-[#1a4a2e] hover:bg-[#1a4a2e]/5"
                                  }`}>
                                  {isSelected ? "Close" : "Manage"}
                                </button>
                              </td>
                            </tr>

                            {/* ── Units toggle bar (per_pound only) ── */}
                            {p.pricing_type === "per_pound" && (
                              <tr className="border-b border-gray-50">
                                <td colSpan={6} className="p-0">
                                  <button
                                    onClick={() => {
                                      if (isExpanded) {
                                        setExpandedProduct(null);
                                      } else {
                                        setExpandedProduct(p.id);
                                        if (!productUnits[p.id]) fetchProductUnits(p.id);
                                      }
                                    }}
                                    className="w-full text-left px-4 py-2 bg-amber-50 hover:bg-amber-100 text-[#1a4a2e] text-sm font-medium transition-colors flex items-center gap-2"
                                  >
                                    <span>⚖️</span>
                                    <span>{isExpanded ? "▲ Hide" : "▼ Manage"} Individual Units</span>
                                    <span className="text-gray-400 font-normal">
                                      ({units.length > 0 ? units.length : (p.stock_qty ?? 0)} units available)
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            )}

                            {/* ── Expanded units panel ── */}
                            {p.pricing_type === "per_pound" && isExpanded && (
                              <tr className="border-b border-gray-100">
                                <td colSpan={6} className="bg-amber-50/40 px-4 pb-4 pt-2">
                                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                                    <h3 className="font-semibold text-[#1a4a2e] mb-1">
                                      Individual Units — {p.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                      Price per pound: <strong>${Number(pricePerPound).toFixed(2)}/lb</strong> — Each unit is listed separately for customers to choose from
                                    </p>

                                    {/* Add New Unit */}
                                    <div className="flex items-end gap-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                      <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Weight (lbs)</label>
                                        <input
                                          type="number"
                                          value={newUnitWeight[p.id] || ""}
                                          onChange={e => setNewUnitWeight(prev => ({ ...prev, [p.id]: e.target.value }))}
                                          placeholder="e.g. 0.65"
                                          step="0.01"
                                          min="0"
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e]"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Calculated Price</label>
                                        <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-semibold text-[#1a4a2e]">
                                          {newUnitWeight[p.id] && pricePerPound
                                            ? `$${(pricePerPound * parseFloat(newUnitWeight[p.id] || "0")).toFixed(2)}`
                                            : "$0.00"}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const weight = parseFloat(newUnitWeight[p.id] || "0");
                                          if (weight > 0) {
                                            addProductUnit(p.id, weight, pricePerPound);
                                          } else {
                                            alert("Please enter a valid weight.");
                                          }
                                        }}
                                        disabled={addingUnit === p.id}
                                        className="bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5"
                                      >
                                        {addingUnit === p.id ? <Spinner /> : null}
                                        {addingUnit === p.id ? "Adding…" : "+ Add Unit"}
                                      </button>
                                    </div>

                                    {/* Units list */}
                                    {loadingUnits === p.id ? (
                                      <div className="flex items-center justify-center py-6">
                                        <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                                      </div>
                                    ) : units.length === 0 ? (
                                      <div className="text-center py-6 text-gray-400">
                                        <p className="text-2xl mb-2">⚖️</p>
                                        <p className="text-sm">No units added yet</p>
                                        <p className="text-xs mt-1">Add individual units above with their exact weights</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 pb-1">
                                          <span>Unit #</span>
                                          <span>Weight</span>
                                          <span>Price</span>
                                          <span>Action</span>
                                        </div>
                                        {units.map((unit, index) => (
                                          <div key={unit.id} className="grid grid-cols-4 gap-2 items-center bg-gray-50 rounded-lg px-3 py-2.5">
                                            <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
                                            <span className="text-sm font-semibold text-gray-800">{unit.weight_lbs} lbs</span>
                                            <span className="text-sm font-bold text-[#1a4a2e]">${Number(unit.price).toFixed(2)}</span>
                                            <button
                                              onClick={() => removeProductUnit(unit.id, p.id)}
                                              className="text-xs text-red-500 hover:text-red-700 font-medium text-left transition-colors"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ))}
                                        <div className="pt-2 border-t border-gray-100 mt-2">
                                          <p className="text-xs text-gray-400 text-right">
                                            {units.length} units total &nbsp;·&nbsp;&nbsp;
                                            {units.reduce((sum, u) => sum + u.weight_lbs, 0).toFixed(2)} lbs combined
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Restock history */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Restock Activity</h3>
                <div className="space-y-2">
                  {history.slice(0, 8).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="font-medium text-gray-800">{entry.product_name}</span>
                        {entry.note && <span className="text-gray-400 ml-2">— {entry.note}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-right shrink-0 ml-4">
                        <span className="text-green-600 font-semibold">+{entry.qty_added} units</span>
                        <span className="text-gray-400 text-xs whitespace-nowrap">{formatDate(entry.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right panel: Product settings ── */}
          {selectedProduct && (
            <div className="w-72 shrink-0 space-y-4">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-3 mb-4">
                  {(selectedProduct.primaryImage || selectedProduct.images?.[0]) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedProduct.primaryImage || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-300 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm leading-tight truncate">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedProduct.categories?.name ?? "No category"}</p>
                    <p className="text-sm font-semibold text-[#1a4a2e] mt-1">
                      {selectedProduct.pricing_type === "per_pound"
                        ? `$${Number(selectedProduct.price_per_pound ?? 0).toFixed(2)}/lb`
                        : `$${Number(selectedProduct.price).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {/* Current stock */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">{selectedProduct.stock_qty ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedProduct.pricing_type === "per_pound" ? "Units Available" : `Current Stock ${selectedProduct.unit ? `(${selectedProduct.unit})` : ""}`}
                  </p>
                </div>

                {/* Restock form — only for non-per_pound products */}
                {selectedProduct.pricing_type !== "per_pound" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Add Stock</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity to Add</label>
                      <input type="number" min="1" placeholder="e.g. 50"
                        value={restockQty} onChange={e => setRestockQty(e.target.value)}
                        className={inputCls + " text-sm py-2"} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</label>
                      <input type="text" placeholder="e.g. Harvested today"
                        value={restockNote} onChange={e => setRestockNote(e.target.value)}
                        className={inputCls + " text-sm py-2"} />
                    </div>
                    <button onClick={handleRestock} disabled={savingRestock || !restockQty}
                      className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                      {savingRestock ? <Spinner /> : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                      )}
                      Add Stock
                    </button>
                  </div>
                )}

                {/* Per-pound: prompt to use the units panel */}
                {selectedProduct.pricing_type === "per_pound" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      ⚖️ Use the <strong>Individual Units</strong> panel in the table to add or remove specific cuts. Stock count is managed automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Product settings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-4">Product Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Low Stock Alert Threshold</label>
                    <input type="number" min="0" placeholder="e.g. 5"
                      value={threshold} onChange={e => setThreshold(e.target.value)}
                      className={inputCls + " text-sm py-2"} />
                    <p className="text-xs text-gray-400 mt-1">Alert when stock drops to or below this number</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Seasonal Product</p>
                      <p className="text-xs text-gray-400 mt-0.5">Only available during certain seasons</p>
                    </div>
                    <button type="button" onClick={() => setIsSeasonal(v => !v)}
                      className={`relative rounded-full transition-colors ${isSeasonal ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
                      style={{ minWidth: '2.5rem', width: '2.5rem', height: '1.375rem' }}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isSeasonal ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Restock Notes</label>
                    <textarea rows={3} placeholder="e.g. Harvest every Tuesday."
                      value={restockNotes} onChange={e => setRestockNotes(e.target.value)}
                      className={inputCls + " text-sm py-2 resize-none"} />
                  </div>
                  <button onClick={handleSaveSettings} disabled={savingSettings}
                    className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    {savingSettings ? <Spinner /> : null}
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
