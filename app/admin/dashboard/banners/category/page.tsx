"use client";

/*
 * SUPABASE TABLE REQUIRED — run this in the Supabase SQL editor:
 *
 * CREATE TABLE category_banners (
 *   id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   category_slug        text NOT NULL UNIQUE,   -- e.g. 'meat-poultry'
 *   category_name        text NOT NULL,           -- e.g. 'Meat & Poultry'
 *   title                text,                    -- hero title (defaults to category_name)
 *   subtitle             text,                    -- description line beneath title
 *   background_image_url text,                    -- full URL to hero background image
 *   overlay_opacity      numeric DEFAULT 0.5,     -- green overlay darkness 0–1
 *   is_active            boolean DEFAULT true,
 *   updated_at           timestamptz DEFAULT now()
 * );
 *
 * -- Allow anon reads for the frontend
 * CREATE POLICY "Public read category_banners"
 * ON category_banners FOR SELECT USING (true);
 *
 * -- Allow authenticated admins to write
 * CREATE POLICY "Admins manage category_banners"
 * ON category_banners FOR ALL
 * USING (auth.role() = 'authenticated');
 */

import { useState, useEffect, useCallback } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminSession, getValidAdminSession, getAuthHeaders } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

/* ── Fixed category list (matches actual category pages in the codebase) ──── */
const CATEGORIES = [
  { slug: "meat-poultry",      name: "Meat & Poultry" },
  { slug: "fruits-vegetables", name: "Fruits & Vegetables" },
  { slug: "dairy-eggs",        name: "Dairy & Eggs" },
  { slug: "seafood",           name: "Seafood" },
  { slug: "bakery-breads",     name: "Bakery & Breads" },
  { slug: "honey-preserves",   name: "Honey & Preserves" },
  { slug: "herbs-botanicals",  name: "Herbs & Botanicals" },
  { slug: "natural-skincare",  name: "Natural Skincare" },
  { slug: "candles-home",      name: "Candles & Home" },
  { slug: "natural-cleaning",  name: "Natural Cleaning" },
];

interface CategoryBanner {
  id?: string;
  category_slug: string;
  category_name: string;
  title: string;
  subtitle: string;
  background_image_url: string;
  overlay_opacity: number;
  is_active: boolean;
  updated_at?: string;
}

type EditingBanner = Partial<CategoryBanner>;

export default function CategoryBannersPage() {
  const [authorized, setAuthorized]   = useState(false);
  const [banners, setBanners]         = useState<{[slug: string]: CategoryBanner}>({});
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState("");
  const [editing, setEditing]         = useState<EditingBanner | null>(null);
  const [uploading, setUploading]     = useState(false);

  /* ── Auth ───────────────────────────────────────────────────── */
  useEffect(() => {
    const session = getAdminSession();
    if (!session?.access_token) { window.location.href = "/admin/login"; return; }
    setAuthorized(true);
  }, []);

  /* ── Fetch existing banners ─────────────────────────────────── */
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const session = await getValidAdminSession();
      if (!session) { window.location.href = "/admin/login"; return; }
      const headers = getAuthHeaders(session.access_token);

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/category_banners?select=*`,
        { headers }
      );
      if (!res.ok) { setFetchError(`Error ${res.status}`); return; }
      const data = await res.json();
      if (Array.isArray(data)) {
        const map: {[slug: string]: CategoryBanner} = {};
        data.forEach((b: CategoryBanner) => { map[b.category_slug] = b; });
        setBanners(map);
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authorized) fetchBanners(); }, [authorized, fetchBanners]);

  /* ── Upload image to Storage ────────────────────────────────── */
  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const fileExt  = file.name.split(".").pop();
      const fileName = `category-banner-${editing?.category_slug}-${Date.now()}.${fileExt}`;
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/platform-assets/${fileName}`,
        {
          method: "POST",
          headers: {
            apikey:         SUPABASE_ANON_KEY,
            Authorization:  `Bearer ${session.access_token}`,
            "Content-Type": file.type,
            "x-upsert":     "true",
          },
          body: file,
        }
      );
      if (!uploadRes.ok) { alert("Upload failed: " + await uploadRes.text()); return; }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/platform-assets/${fileName}`;
      setEditing(prev => prev ? { ...prev, background_image_url: publicUrl } : prev);
      setSuccess("Image uploaded!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Upload error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
    }
  };

  /* ── Save (upsert) ──────────────────────────────────────────── */
  const handleSave = async () => {
    if (!editing?.category_slug) return;
    setSaving(true);
    setSuccess("");
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const headers = {
        ...getAuthHeaders(session.access_token),
        Prefer: "resolution=merge-duplicates,return=representation",
      };

      const payload: Partial<CategoryBanner> = {
        category_slug:        editing.category_slug,
        category_name:        editing.category_name ?? "",
        title:                editing.title?.trim() || editing.category_name || "",
        subtitle:             editing.subtitle?.trim() ?? "",
        background_image_url: editing.background_image_url ?? "",
        overlay_opacity:      editing.overlay_opacity ?? 0.5,
        is_active:            editing.is_active ?? true,
        updated_at:           new Date().toISOString(),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/category_banners`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Save failed: " + err);
        return;
      }

      setSuccess(`Banner for "${editing.category_name}" saved.`);
      setEditing(null);
      await fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived counts ─────────────────────────────────────────── */
  const withBanner  = CATEGORIES.filter(c => banners[c.slug]?.background_image_url).length;
  const usingDefault = CATEGORIES.length - withBanner;

  /* ── Auth gate ──────────────────────────────────────────────── */
  if (!authorized) return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
    </div>
  );

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5 max-w-5xl">

            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Category Banners</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage hero banners for each product category page</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Categories",   value: CATEGORIES.length, color: "text-gray-900"  },
                { label: "With Custom Banner",  value: withBanner,        color: "text-green-700" },
                { label: "Using Default",       value: usingDefault,      color: "text-gray-400"  },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {fetchError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                Failed to load banners: {fetchError}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                {success}
              </div>
            )}

            {/* Category list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">All Categories</p>
                <p className="text-xs text-gray-400 mt-0.5">Click Edit on any category to set a custom hero banner image.</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {CATEGORIES.map(cat => {
                    const banner = banners[cat.slug];
                    const hasBanner = !!banner?.background_image_url;

                    return (
                      <div key={cat.slug} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                        {/* Thumbnail */}
                        <div
                          className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                          style={{
                            backgroundColor: "#053D2D",
                            backgroundImage: hasBanner ? `url(${banner.background_image_url})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {!hasBanner && (
                            <span className="text-white/40 text-[10px] font-medium text-center px-1">No image</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">/category/{cat.slug}</p>
                          {banner?.subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{banner.subtitle}</p>
                          )}
                        </div>

                        {/* Badge */}
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                          hasBanner ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {hasBanner ? "Custom" : "Default"}
                        </span>

                        {/* Edit */}
                        <button
                          onClick={() => setEditing({
                            category_slug:        cat.slug,
                            category_name:        cat.name,
                            title:                banner?.title        ?? cat.name,
                            subtitle:             banner?.subtitle     ?? "",
                            background_image_url: banner?.background_image_url ?? "",
                            overlay_opacity:      banner?.overlay_opacity      ?? 0.5,
                            is_active:            banner?.is_active            ?? true,
                          })}
                          className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors flex-shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Edit Banner — {editing.category_name}
              </h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">

              {/* Live mini-preview */}
              <div
                className="w-full h-28 rounded-xl overflow-hidden relative flex items-center justify-center"
                style={{
                  backgroundColor: "#053D2D",
                  backgroundImage: editing.background_image_url ? `url(${editing.background_image_url})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: `rgba(5,61,45,${editing.overlay_opacity ?? 0.5})` }}
                />
                <div className="relative z-10 text-center px-4">
                  <p className="text-white font-bold text-base font-raleway leading-tight">
                    {editing.title || editing.category_name}
                  </p>
                  {editing.subtitle && (
                    <p className="text-white/80 text-xs mt-1">{editing.subtitle}</p>
                  )}
                </div>
                <span className="absolute top-2 right-2 text-[10px] bg-black/40 text-white px-2 py-0.5 rounded-full">Preview</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hero Title</label>
                <input
                  type="text"
                  value={editing.title ?? ""}
                  onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)}
                  placeholder={editing.category_name}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subtitle / Description</label>
                <textarea
                  value={editing.subtitle ?? ""}
                  onChange={e => setEditing(p => p ? { ...p, subtitle: e.target.value } : p)}
                  rows={2}
                  placeholder="A short description shown beneath the title…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition resize-none"
                />
              </div>

              {/* Background image */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Background Image</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editing.background_image_url ?? ""}
                    onChange={e => setEditing(p => p ? { ...p, background_image_url: e.target.value } : p)}
                    placeholder="https://... or upload below"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                  />
                  <label className="cursor-pointer bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                    {uploading ? (
                      <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Uploading…</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">Recommended: 1400×300px or wider. Will be cropped to fill the hero height.</p>
              </div>

              {/* Overlay opacity slider */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Green Overlay Opacity —{" "}
                  <span className="text-[#1a4a2e]">{((editing.overlay_opacity ?? 0.5) * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min={0.1} max={0.9} step={0.05}
                  value={editing.overlay_opacity ?? 0.5}
                  onChange={e => setEditing(p => p ? { ...p, overlay_opacity: Number(e.target.value) } : p)}
                  className="w-full accent-[#1a4a2e]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Lighter (image visible)</span>
                  <span>Darker (text readable)</span>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-600">Active</label>
                <div
                  onClick={() => setEditing(p => p ? { ...p, is_active: !p.is_active } : p)}
                  className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${editing.is_active ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.is_active ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-xs text-gray-500">{editing.is_active ? "Banner is live" : "Using default green hero"}</span>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>}
                {saving ? "Saving…" : "Save Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
