"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import SellerLayout from "@/components/seller/SellerLayout";
import { getValidSellerSession } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const INPUT = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

const TABS = ["branding", "about", "contact", "social", "location"] as const;
type Tab = typeof TABS[number];

const FARM_SIZES = [
  { value: "", label: "Select size" },
  { value: "urban", label: "Urban Farm / Garden" },
  { value: "small", label: "Small Family Farm (under 50 acres)" },
  { value: "medium", label: "Medium Farm (50–200 acres)" },
  { value: "large", label: "Large Farm (200+ acres)" },
  { value: "home", label: "Home Producer" },
];

interface StoreForm {
  farm_name: string;
  tagline: string;
  description: string;
  location_address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  year_established: string;
  farm_size: string;
  pickup_address: string;
  pickup_hours: string;
  pickup_instructions: string;
}

const EMPTY_FORM: StoreForm = {
  farm_name: "",
  tagline: "",
  description: "",
  location_address: "",
  city: "",
  state: "",
  zip_code: "",
  phone: "",
  email: "",
  website: "",
  instagram_url: "",
  facebook_url: "",
  twitter_url: "",
  year_established: "",
  farm_size: "",
  pickup_address: "",
  pickup_hours: "",
  pickup_instructions: "",
};

export default function StoreEditorPage() {
  const [session, setSession] = useState<{ access_token: string; seller_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("branding");

  const [form, setForm] = useState<StoreForm>(EMPTY_FORM);
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [shopBannerUrl, setShopBannerUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingShopBanner, setUploadingShopBanner] = useState(false);

  const getHeaders = useCallback(
    (token: string) => ({
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    []
  );

  const flash = (type: "success" | "error", msg: string) => {
    if (type === "success") { setSuccessMsg(msg); setErrorMsg(""); }
    else { setErrorMsg(msg); setSuccessMsg(""); }
    setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); }, 3500);
  };

  const fetchStoreData = useCallback(
    async (sess: { access_token: string; seller_id: string }) => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/sellers?id=eq.${sess.seller_id}&select=*`,
          { headers: getHeaders(sess.access_token) }
        );
        const data = await res.json();
        const store = Array.isArray(data) ? data[0] : null;
        if (store) {
          setForm({
            farm_name:            store.farm_name            ?? "",
            tagline:              store.tagline              ?? "",
            description:          store.description          ?? "",
            location_address:     store.location_address     ?? "",
            city:                 store.city                 ?? "",
            state:                store.state                ?? "",
            zip_code:             store.zip_code             ?? "",
            phone:                store.phone                ?? "",
            email:                store.email                ?? "",
            website:              store.website              ?? "",
            instagram_url:        store.instagram_url        ?? "",
            facebook_url:         store.facebook_url         ?? "",
            twitter_url:          store.twitter_url          ?? "",
            year_established:     store.year_established     ?? "",
            farm_size:            store.farm_size            ?? "",
            pickup_address:       store.pickup_address       ?? "",
            pickup_hours:         store.pickup_hours         ?? "",
            pickup_instructions:  store.pickup_instructions  ?? "",
          });
          setLogoUrl(store.logo_url             ?? "");
          setBannerUrl(store.banner_url         ?? "");
          setShopBannerUrl(store.shop_banner_url ?? "");
        }
      } catch (err) {
        console.error("Fetch store error:", err);
      } finally {
        setLoading(false);
      }
    },
    [getHeaders]
  );

  useEffect(() => {
    getValidSellerSession().then(sess => {
      if (!sess) return;
      setSession(sess);
      fetchStoreData(sess);
    });
  }, [fetchStoreData]);

  const saveStoreData = async () => {
    const session = await getValidSellerSession();
    if (!session) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?id=eq.${session.seller_id}`,
        {
          method: "PATCH",
          headers: { ...getHeaders(session.access_token), Prefer: "return=representation" },
          body: JSON.stringify({
            farm_name:            form.farm_name,
            tagline:              form.tagline,
            description:          form.description,
            location_address:     form.location_address,
            city:                 form.city,
            state:                form.state,
            zip_code:             form.zip_code,
            phone:                form.phone,
            email:                form.email,
            website:              form.website,
            instagram_url:        form.instagram_url,
            facebook_url:         form.facebook_url,
            twitter_url:          form.twitter_url,
            year_established:     form.year_established,
            farm_size:            form.farm_size,
            pickup_address:       form.pickup_address,
            pickup_hours:         form.pickup_hours,
            pickup_instructions:  form.pickup_instructions,
            logo_url:             logoUrl,
            banner_url:           bannerUrl,
            shop_banner_url:      shopBannerUrl,
            updated_at:           new Date().toISOString(),
          }),
        }
      );
      if (!res.ok) { flash("error", "Save failed: " + await res.text()); return; }
      flash("success", "Store updated successfully!");
    } catch (err: unknown) {
      flash("error", "Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const saveField = async (fields: object) => {
    const sess = await getValidSellerSession();
    if (!sess) return;
    await fetch(`${SUPABASE_URL}/rest/v1/sellers?id=eq.${sess.seller_id}`, {
      method: "PATCH",
      headers: { ...getHeaders(sess.access_token), Prefer: "return=representation" },
      body: JSON.stringify(fields),
    });
  };

  const uploadImage = async (file: File, type: "logo" | "banner" | "shop-banner") => {
    const session = await getValidSellerSession();
    if (!session) return;
    const isLogo       = type === "logo";
    const isShopBanner = type === "shop-banner";

    if (isLogo) setUploadingLogo(true);
    else if (isShopBanner) setUploadingShopBanner(true);
    else setUploadingBanner(true);

    try {
      const ext = file.name.split(".").pop();
      const bucket = isLogo ? "seller-logos" : "seller-banners";
      const fileName = `${session.seller_id}-${type}-${Date.now()}.${ext}`;

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`,
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
        flash("error", `Upload failed: ${await uploadRes.text()}`);
        return;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;

      if (isLogo) {
        setLogoUrl(publicUrl);
        await saveField({ logo_url: publicUrl });
      } else if (isShopBanner) {
        setShopBannerUrl(publicUrl);
        await saveField({ shop_banner_url: publicUrl });
      } else {
        setBannerUrl(publicUrl);
        await saveField({ banner_url: publicUrl });
      }

      flash("success", `${isLogo ? "Logo" : isShopBanner ? "Shop banner" : "Banner"} uploaded!`);
    } catch (err: unknown) {
      flash("error", "Upload error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (isLogo) setUploadingLogo(false);
      else if (isShopBanner) setUploadingShopBanner(false);
      else setUploadingBanner(false);
    }
  };

  const set = (key: keyof StoreForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const locationDisplay = [form.city, form.state].filter(Boolean).join(", ");

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center py-24">
          <svg className="w-6 h-6 animate-spin text-[#1a4a2e]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-6xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Store Editor</h1>
            <p className="text-sm text-gray-500 mt-0.5">Customize how your store appears to customers</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {session && (
              <Link
                href={`/store/${session.seller_id}`}
                target="_blank"
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Preview Store
              </Link>
            )}
            <button
              onClick={saveStoreData}
              disabled={saving}
              className="bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Toast messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Editor — left 3 cols */}
          <div className="lg:col-span-3 space-y-5">

            {/* Tab navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-100">
                {TABS.map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-5 py-3.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === t
                        ? "border-[#1a4a2e] text-[#1a4a2e]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* ── BRANDING ── */}
              {activeTab === "branding" && (
                <div className="p-6 space-y-6">
                  {/* Banner */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Store Banner</p>
                    <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center mb-3 relative">
                      {bannerUrl ? (
                        <Image src={bannerUrl} alt="Store banner" fill className="object-cover"/>
                      ) : (
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <p className="text-xs text-gray-400">Recommended 1200 × 400px</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        {uploadingBanner ? "Uploading..." : "Upload Banner"}
                        <input type="file" accept="image/*" className="hidden"
                          disabled={uploadingBanner}
                          onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "banner")}/>
                      </label>
                      {bannerUrl && (
                        <button onClick={() => setBannerUrl("")} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                      )}
                    </div>
                  </div>

                  {/* Shop Page Banner */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Shop Page Banner</p>
                    <p className="text-xs text-gray-400 mb-2">
                      Appears at the top of your Shop page. Falls back to your main store banner if not set.
                    </p>
                    <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center mb-3 relative">
                      {shopBannerUrl ? (
                        <Image src={shopBannerUrl} alt="Shop banner" fill className="object-cover"/>
                      ) : bannerUrl ? (
                        <>
                          <Image src={bannerUrl} alt="Main banner fallback" fill className="object-cover opacity-40"/>
                          <span className="relative z-10 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Using main store banner as default
                          </span>
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-gray-400">No shop banner uploaded</p>
                          <p className="text-xs text-gray-400 mt-0.5">Will use main banner if available</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        {uploadingShopBanner ? "Uploading..." : "Upload Shop Banner"}
                        <input type="file" accept="image/*" className="hidden"
                          disabled={uploadingShopBanner}
                          onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "shop-banner")}/>
                      </label>
                      {shopBannerUrl && (
                        <button onClick={() => setShopBannerUrl("")} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                      )}
                    </div>
                  </div>

                  {/* Logo */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Store Logo</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 relative">
                        {logoUrl ? (
                          <Image src={logoUrl} alt="Store logo" fill className="object-cover"/>
                        ) : (
                          <span className="text-2xl font-bold text-gray-300">
                            {form.farm_name.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Recommended 400 × 400px</p>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                            {uploadingLogo ? "Uploading..." : "Upload Logo"}
                            <input type="file" accept="image/*" className="hidden"
                              disabled={uploadingLogo}
                              onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "logo")}/>
                          </label>
                          {logoUrl && (
                            <button onClick={() => setLogoUrl("")} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name / Tagline */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm Name</label>
                      <input type="text" value={form.farm_name} onChange={set("farm_name")} placeholder="Your Farm Name" className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
                      <input type="text" value={form.tagline} onChange={set("tagline")} placeholder="e.g. Where Quality Meets Community" className={INPUT}/>
                    </div>
                  </div>

                </div>
              )}

              {/* ── ABOUT ── */}
              {activeTab === "about" && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm Description</label>
                    <textarea
                      value={form.description}
                      onChange={set("description")}
                      rows={6}
                      placeholder="Tell customers about your farm, your practices and what makes you unique..."
                      className={INPUT + " resize-none"}
                    />
                    <p className="text-xs text-gray-400 mt-1">{form.description.length} characters</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Year Established</label>
                      <input type="text" value={form.year_established} onChange={set("year_established")} placeholder="e.g. 2018" className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm Size</label>
                      <select value={form.farm_size} onChange={set("farm_size")} className={INPUT}>
                        {FARM_SIZES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTACT ── */}
              {activeTab === "contact" && (
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Contact Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                        <input type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" className={INPUT}/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input type="email" value={form.email} onChange={set("email")} placeholder="farm@example.com" className={INPUT}/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                      <input type="url" value={form.website} onChange={set("website")} placeholder="https://yourfarm.com" className={INPUT}/>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Pickup Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Address</label>
                      <input type="text" value={form.pickup_address} onChange={set("pickup_address")} placeholder="123 Farm Road, Houston TX 77001" className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Hours</label>
                      <input type="text" value={form.pickup_hours} onChange={set("pickup_hours")} placeholder="e.g. Mon–Fri 9am–5pm, Sat 9am–12pm" className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Instructions</label>
                      <textarea
                        value={form.pickup_instructions}
                        onChange={set("pickup_instructions")}
                        rows={3}
                        placeholder="Enter through the main gate, parking available on the left..."
                        className={INPUT + " resize-none"}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SOCIAL ── */}
              {activeTab === "social" && (
                <div className="p-6 space-y-4">
                  {[
                    { key: "instagram_url" as keyof StoreForm, label: "Instagram URL", placeholder: "https://instagram.com/yourfarm" },
                    { key: "facebook_url"  as keyof StoreForm, label: "Facebook URL",  placeholder: "https://facebook.com/yourfarm"  },
                    { key: "twitter_url"   as keyof StoreForm, label: "Twitter / X URL", placeholder: "https://twitter.com/yourfarm" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <input type="url" value={form[key] as string} onChange={set(key)} placeholder={placeholder} className={INPUT}/>
                    </div>
                  ))}
                </div>
              )}

              {/* ── LOCATION ── */}
              {activeTab === "location" && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                    <input type="text" value={form.location_address} onChange={set("location_address")} placeholder="123 Farm Road" className={INPUT}/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                      <input type="text" value={form.city} onChange={set("city")} placeholder="Houston" className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                      <input type="text" value={form.state} onChange={set("state")} placeholder="TX" className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
                      <input type="text" value={form.zip_code} onChange={set("zip_code")} placeholder="77001" className={INPUT}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={saveStoreData}
                disabled={saving}
                className="bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-60 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? "Saving Changes..." : "Save All Changes"}
              </button>
            </div>
          </div>

          {/* Live preview — right 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Live Preview</p>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Banner */}
                <div className="h-28 relative overflow-hidden bg-gradient-to-br from-[#1a4a2e] to-[#2d6b47]">
                  {bannerUrl ? (
                    <Image src={bannerUrl} alt="Banner preview" fill className="object-cover"/>
                  ) : (
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 200 80" fill="white" className="w-full h-full">
                        <circle cx="20" cy="20" r="15" opacity="0.5"/>
                        <circle cx="180" cy="60" r="20" opacity="0.4"/>
                        <circle cx="100" cy="10" r="8"  opacity="0.3"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-5">
                  {/* Logo + badge row */}
                  <div className="flex items-end gap-3 -mt-6 mb-3">
                    <div className="w-12 h-12 rounded-xl border-2 border-white shadow overflow-hidden shrink-0 relative bg-[#1a4a2e] flex items-center justify-center">
                      {logoUrl
                        ? <Image src={logoUrl} alt="Logo preview" fill className="object-cover"/>
                        : <span className="text-white font-bold text-lg">{form.farm_name.charAt(0).toUpperCase() || "?"}</span>
                      }
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{form.farm_name || "Farm Name"}</h3>
                  {form.tagline && <p className="text-xs text-gray-500 mt-0.5 italic">{form.tagline}</p>}

                  {form.description && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{form.description}</p>
                  )}

                  {locationDisplay && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {locationDisplay}
                    </div>
                  )}

                  {form.phone && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {form.phone}
                    </div>
                  )}

                  {(form.instagram_url || form.facebook_url || form.twitter_url) && (
                    <div className="flex gap-2 mt-3">
                      {form.instagram_url && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Instagram</span>
                      )}
                      {form.facebook_url && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Facebook</span>
                      )}
                      {form.twitter_url && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Twitter</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">How your store appears to shoppers</p>
            </div>
          </div>

        </div>
      </div>
    </SellerLayout>
  );
}
