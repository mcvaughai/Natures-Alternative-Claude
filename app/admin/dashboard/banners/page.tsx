"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminSession, getValidAdminSession, getAuthHeaders } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  background_image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  position: number;
  created_at: string;
}

type EditingBanner = Partial<Banner> & { _new?: boolean };

export default function BannersPage() {
  const [authorized, setAuthorized]           = useState(false);
  const [banners, setBanners]                 = useState<Banner[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [fetchError, setFetchError]           = useState("");
  const [saving, setSaving]                   = useState(false);
  const [success, setSuccess]                 = useState("");
  const [editing, setEditing]                 = useState<EditingBanner | null>(null);
  const [deleting, setDeleting]               = useState<string | null>(null);
  const [uploadingBannerImage, setUploadingBannerImage] = useState<string | null>(null);

  // ── Hero banner state ─────────────────────────────────────
  // NOTE: Run this SQL in Supabase to seed the hero row if it doesn't exist:
  // INSERT INTO homepage_banners (title, subtitle, background_image_url, is_active, position)
  // VALUES ('hero', 'Homepage hero banner', '', true, 0)
  // ON CONFLICT DO NOTHING;
  const [heroImageUrl, setHeroImageUrl]       = useState("");
  const [heroSaving, setHeroSaving]           = useState(false);
  const [heroSuccess, setHeroSuccess]         = useState("");
  const [heroError, setHeroError]             = useState("");

  /* ── Auth check ─────────────────────────────────────────── */
  useEffect(() => {
    const session = getAdminSession();
    if (!session?.access_token) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthorized(true);
  }, []);

  /* ── Fetch hero banner ───────────────────────────────────── */
  const fetchHeroBanner = useCallback(async () => {
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/homepage_banners?title=eq.hero&select=background_image_url`,
        { headers: getAuthHeaders(session.access_token) }
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.background_image_url) {
        setHeroImageUrl(data[0].background_image_url);
      }
    } catch (err) {
      console.error("Failed to fetch hero banner:", err);
    }
  }, []);

  /* ── Save hero banner ────────────────────────────────────── */
  const saveHeroBanner = async () => {
    setHeroSaving(true);
    setHeroSuccess("");
    setHeroError("");
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const authHeaders = {
        ...getAuthHeaders(session.access_token),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      };

      // Check if record exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/homepage_banners?title=eq.hero&select=id`,
        { headers: getAuthHeaders(session.access_token) }
      );
      const checkData = await checkRes.json();
      const exists = Array.isArray(checkData) && checkData.length > 0;

      if (exists) {
        await fetch(`${SUPABASE_URL}/rest/v1/homepage_banners?title=eq.hero`, {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ background_image_url: heroImageUrl, updated_at: new Date().toISOString() }),
        });
      } else {
        await fetch(`${SUPABASE_URL}/rest/v1/homepage_banners`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            title: "hero",
            subtitle: "Homepage hero banner",
            background_image_url: heroImageUrl,
            is_active: true,
            position: 0,
          }),
        });
      }
      setHeroSuccess("Hero image updated successfully");
      setTimeout(() => setHeroSuccess(""), 3000);
    } catch (err: unknown) {
      setHeroError("Failed to save: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setHeroSaving(false);
    }
  };

  /* ── Fetch banners ───────────────────────────────────────── */
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const session = await getValidAdminSession();
      if (!session) { window.location.href = "/admin/login"; return; }
      const headers = getAuthHeaders(session.access_token);

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/homepage_banners?title=neq.hero&select=*&order=position.asc`,
        { headers }
      );
      if (!res.ok) { setFetchError(`Error ${res.status}`); return; }
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchBanners();
      fetchHeroBanner();
    }
  }, [authorized, fetchBanners, fetchHeroBanner]);

  /* ── Toggle active ───────────────────────────────────────── */
  const handleToggleActive = async (banner: Banner) => {
    setSaving(true);
    setSuccess("");
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const headers = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };
      await fetch(`${SUPABASE_URL}/rest/v1/homepage_banners?id=eq.${banner.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      setSuccess(`Banner "${banner.title}" ${!banner.is_active ? "activated" : "deactivated"}.`);
      await fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload banner image ─────────────────────────────────── */
  const uploadBannerImage = async (file: File, bannerId: string) => {
    setUploadingBannerImage(bannerId);
    try {
      const session = await getValidAdminSession();
      if (!session) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `banner-${bannerId}-${Date.now()}.${fileExt}`;

      // 1. Upload file to Storage
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/platform-assets/${fileName}`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": file.type,
            "x-upsert": "true",
          },
          body: file,
        }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        alert("Upload failed: " + err);
        return;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/platform-assets/${fileName}`;

      // 2. Update editing state immediately so the preview refreshes
      setEditing(prev => prev ? { ...prev, background_image_url: publicUrl } : prev);

      // 3. Only auto-save to DB when editing an existing banner (not a new unsaved one)
      if (bannerId !== "new") {
        const saveRes = await fetch(
          `${SUPABASE_URL}/rest/v1/homepage_banners?id=eq.${bannerId}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              background_image_url: publicUrl,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (saveRes.ok) {
          // Reflect the new URL in the banner list so the live preview updates too
          setBanners(prev => prev.map(b =>
            b.id === bannerId ? { ...b, background_image_url: publicUrl } : b
          ));
          setSuccess("Image uploaded and saved!");
        } else {
          const err = await saveRes.text();
          alert("Image uploaded but failed to save URL: " + err);
        }
      } else {
        // New banner — URL is in editing state; it will be saved when user clicks Create
        setSuccess("Image uploaded! Click Create Banner to save.");
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      alert("Upload error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingBannerImage(null);
    }
  };

  /* ── Save (create or update) ─────────────────────────────── */
  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) { alert("Title is required."); return; }
    setSaving(true);
    setSuccess("");
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const headers = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };

      const payload = {
        title:                editing.title?.trim() ?? "",
        subtitle:             editing.subtitle?.trim() ?? "",
        image_url:            editing.image_url?.trim() || null,
        background_image_url: editing.background_image_url || null,
        link_url:             editing.link_url?.trim() || null,
        is_active:            editing.is_active ?? true,
        position:             editing.position ?? (banners.length + 1),
      };

      if (editing._new) {
        await fetch(`${SUPABASE_URL}/rest/v1/homepage_banners`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        setSuccess("Banner created successfully.");
      } else {
        await fetch(`${SUPABASE_URL}/rest/v1/homepage_banners?id=eq.${editing.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        });
        setSuccess("Banner updated successfully.");
      }
      setEditing(null);
      await fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ──────────────────────────────────────────────── */
  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Delete banner "${banner.title}"? This cannot be undone.`)) return;
    setDeleting(banner.id);
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const headers = getAuthHeaders(session.access_token);
      await fetch(`${SUPABASE_URL}/rest/v1/homepage_banners?id=eq.${banner.id}`, {
        method: "DELETE",
        headers,
      });
      setSuccess(`Banner "${banner.title}" deleted.`);
      await fetchBanners();
    } finally {
      setDeleting(null);
    }
  };

  /* ── Move position ───────────────────────────────────────── */
  const handleMove = async (banner: Banner, dir: "up" | "down") => {
    const idx = banners.findIndex((b) => b.id === banner.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    setSaving(true);
    try {
      const session = await getValidAdminSession();
      if (!session) return;
      const headers = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };
      const other = banners[swapIdx];

      await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/homepage_banners?id=eq.${banner.id}`, {
          method: "PATCH", headers,
          body: JSON.stringify({ position: other.position }),
        }),
        fetch(`${SUPABASE_URL}/rest/v1/homepage_banners?id=eq.${other.id}`, {
          method: "PATCH", headers,
          body: JSON.stringify({ position: banner.position }),
        }),
      ]);
      await fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / auth gate ─────────────────────────────────── */
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5 max-w-4xl">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Banner Manager</h1>
              <button
                onClick={() => setEditing({ _new: true, title: "", subtitle: "", image_url: "", background_image_url: null, link_url: "", is_active: true, position: banners.length + 1 })}
                className="flex items-center gap-2 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                New Banner
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total",    value: banners.length,                        color: "text-gray-900" },
                { label: "Active",   value: banners.filter(b => b.is_active).length, color: "text-green-700" },
                { label: "Inactive", value: banners.filter(b => !b.is_active).length, color: "text-gray-400" },
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

            {/* ── Hero Banner Section ───────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Hero Banner</p>
                <p className="text-xs text-gray-400 mt-0.5">Controls the background image of the homepage hero section.</p>
              </div>
              <div className="px-5 py-5 space-y-4">
                {/* Current image preview */}
                <div
                  className="w-full rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center"
                  style={{
                    height: "160px",
                    backgroundColor: "#053D2D",
                    backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {heroImageUrl ? (
                    <div className="w-full h-full flex items-end justify-start p-4"
                      style={{ background: "rgba(5,61,45,0.45)" }}>
                      <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded-lg">
                        Current hero background
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white opacity-30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p className="text-white text-xs opacity-40">No image set — showing solid green background</p>
                    </div>
                  )}
                </div>

                {/* URL input + Preview button */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Background Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={heroImageUrl}
                      onChange={e => setHeroImageUrl(e.target.value)}
                      placeholder="https://your-bucket.supabase.co/storage/v1/object/public/..."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition"
                    />
                    {heroImageUrl && (
                      <a
                        href={heroImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                        Preview
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Recommended size: 1440 × 700px. Use a high quality landscape photo.
                  </p>
                </div>

                {/* Feedback messages */}
                {heroSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5">
                    ✅ {heroSuccess}
                  </div>
                )}
                {heroError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
                    ❌ {heroError}
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={saveHeroBanner}
                  disabled={heroSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#053D2D" }}
                >
                  {heroSaving && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                  )}
                  {heroSaving ? "Saving..." : "Save Hero Image"}
                </button>
              </div>
            </div>

            {/* Banner List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Homepage Banners</p>
                <p className="text-xs text-gray-400 mt-0.5">Banners display in position order. Only active banners appear on the site.</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm text-gray-400">No banners yet.</p>
                  <p className="text-xs text-gray-300 mt-1">Click "New Banner" to add your first one.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {banners.map((banner, idx) => (
                    <div key={banner.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      {/* Preview thumbnail */}
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 relative">
                        {banner.image_url ? (
                          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-1 left-1">
                          <span className="text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">#{banner.position}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800 truncate">{banner.title}</p>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {banner.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{banner.subtitle}</p>}
                        {banner.link_url && (
                          <p className="text-xs text-[#1a4a2e] mt-0.5 truncate font-mono">{banner.link_url}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {/* Move up/down */}
                        <button
                          onClick={() => handleMove(banner, "up")}
                          disabled={idx === 0 || saving}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Move up"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMove(banner, "down")}
                          disabled={idx === banners.length - 1 || saving}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Move down"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleActive(banner)}
                          disabled={saving}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            banner.is_active
                              ? "text-gray-500 border-gray-200 hover:bg-gray-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }`}
                        >
                          {banner.is_active ? "Deactivate" : "Activate"}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditing({ ...banner })}
                          className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-2.5 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors"
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(banner)}
                          disabled={deleting === banner.id}
                          className="text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleting === banner.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live preview */}
            {banners.some(b => b.is_active) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-1">Live Preview</p>
                <p className="text-xs text-gray-400 mb-4">This is how active banners look on the homepage (up to 3 are shown). Updates in real time while editing.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {banners.filter(b => b.is_active).slice(0, 3).map(banner => {
                    // Show live editing state for the banner currently being edited
                    const isBeingEdited = editing?.id === banner.id;
                    const previewBgImage = isBeingEdited
                      ? (editing.background_image_url || banner.background_image_url || banner.image_url)
                      : (banner.background_image_url || banner.image_url);
                    const previewTitle    = isBeingEdited ? (editing.title    ?? banner.title)    : banner.title;
                    const previewSubtitle = isBeingEdited ? (editing.subtitle ?? banner.subtitle) : banner.subtitle;

                    return (
                      <div
                        key={banner.id}
                        className="relative overflow-hidden rounded-xl flex items-end"
                        style={{
                          backgroundColor: "#053D2D",
                          minHeight: "100px",
                          backgroundImage: previewBgImage ? `url(${previewBgImage})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Dark overlay when image is set */}
                        {previewBgImage && (
                          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
                        )}
                        {/* Placeholder icon when no image */}
                        {!previewBgImage && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                        )}
                        <div className="relative z-10 w-full px-3 py-2.5 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-white font-bold text-xs leading-tight">{previewTitle}</p>
                          {previewSubtitle && <p className="text-white/80 text-[10px] mt-0.5">{previewSubtitle}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Edit / Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                {editing._new ? "New Banner" : "Edit Banner"}
              </h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editing.title ?? ""}
                  onChange={e => setEditing(prev => prev ? { ...prev, title: e.target.value } : prev)}
                  placeholder="e.g. Fresh Produce Delivered Daily"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={editing.subtitle ?? ""}
                  onChange={e => setEditing(prev => prev ? { ...prev, subtitle: e.target.value } : prev)}
                  placeholder="e.g. Straight from the farm to your door"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>

              {/* Banner Background Image — upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Background Image
                </label>

                {/* Image Preview */}
                <div
                  className="w-full h-32 rounded-xl overflow-hidden mb-3 flex items-center justify-center border-2 border-dashed border-gray-300"
                  style={{
                    backgroundImage: editing.background_image_url
                      ? `url(${editing.background_image_url})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#053D2D",
                  }}
                >
                  {!editing.background_image_url && (
                    <p className="text-white text-sm opacity-70">No image uploaded</p>
                  )}
                </div>

                {/* Upload + Remove buttons */}
                <div className="flex gap-3">
                  <label className="cursor-pointer bg-green-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 inline-block">
                    {uploadingBannerImage === (editing.id ?? "new") ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingBannerImage === (editing.id ?? "new")}
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          uploadBannerImage(e.target.files[0], editing.id ?? "new");
                        }
                      }}
                    />
                  </label>
                  {editing.background_image_url && (
                    <button
                      type="button"
                      onClick={() => setEditing(prev => prev ? { ...prev, background_image_url: null } : prev)}
                      className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Image will overlay on top of background color. Recommended size: 800x200px
                </p>
              </div>

              {/* Image URL (manual fallback) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image URL <span className="text-gray-400 font-normal">(or paste a URL directly)</span></label>
                <input
                  type="url"
                  value={editing.image_url ?? ""}
                  onChange={e => setEditing(prev => prev ? { ...prev, image_url: e.target.value } : prev)}
                  placeholder="https://your-bucket.supabase.co/..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
                {editing.image_url && (
                  <div className="mt-2 rounded-xl overflow-hidden h-24 bg-gray-100">
                    <img src={editing.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link URL <span className="text-gray-400 font-normal">(where banner clicks go)</span></label>
                <input
                  type="text"
                  value={editing.link_url ?? ""}
                  onChange={e => setEditing(prev => prev ? { ...prev, link_url: e.target.value } : prev)}
                  placeholder="/explore or https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Position</label>
                  <input
                    type="number" min={1}
                    value={editing.position ?? banners.length + 1}
                    onChange={e => setEditing(prev => prev ? { ...prev, position: Number(e.target.value) } : prev)}
                    className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setEditing(prev => prev ? { ...prev, is_active: !prev.is_active } : prev)}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${editing.is_active ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.is_active ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <span className="text-sm text-gray-600">{editing.is_active ? "Active" : "Inactive"}</span>
                  </label>
                </div>
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
                {saving && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                )}
                {saving ? "Saving..." : editing._new ? "Create Banner" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
