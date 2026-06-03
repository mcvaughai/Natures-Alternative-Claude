"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import SellerLayout from "@/components/seller/SellerLayout";
import { getValidSellerSession } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const INPUT =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

const TABS = [
  "branding", "about", "contact", "social", "location",
  "homepage", "aboutpage", "blog",
] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, string> = {
  branding:  "Branding",
  about:     "About",
  contact:   "Contact",
  social:    "Social",
  location:  "Location",
  homepage:  "Home Page",
  aboutpage: "About Us Page",
  blog:      "Blog",
};

const FARM_SIZES = [
  { value: "", label: "Select size" },
  { value: "urban",  label: "Urban Farm / Garden" },
  { value: "small",  label: "Small Family Farm (under 50 acres)" },
  { value: "medium", label: "Medium Farm (50–200 acres)" },
  { value: "large",  label: "Large Farm (200+ acres)" },
  { value: "home",   label: "Home Producer" },
];

const FARMING_PRACTICE_OPTIONS = [
  { key: "noSyntheticPesticides", label: "✓ No Synthetic Pesticides" },
  { key: "noGMO",                 label: "✓ No GMO Products" },
  { key: "regenerativeFarming",   label: "✓ Regenerative Farming" },
  { key: "pastureRaised",         label: "✓ Pasture Raised" },
  { key: "grassFed",              label: "✓ Grass Fed & Finished" },
  { key: "freeRange",             label: "✓ Free Range" },
  { key: "humaneCertified",       label: "✓ Humane Certified" },
  { key: "smallBatch",            label: "✓ Small Batch Handmade" },
];

interface StoreForm {
  farm_name: string; tagline: string; description: string;
  location_address: string; city: string; state: string; zip_code: string;
  phone: string; email: string; website: string;
  instagram_url: string; facebook_url: string; twitter_url: string;
  year_established: string; farm_size: string;
  pickup_address: string; pickup_hours: string; pickup_instructions: string;
}

const EMPTY_FORM: StoreForm = {
  farm_name: "", tagline: "", description: "",
  location_address: "", city: "", state: "", zip_code: "",
  phone: "", email: "", website: "",
  instagram_url: "", facebook_url: "", twitter_url: "",
  year_established: "", farm_size: "",
  pickup_address: "", pickup_hours: "", pickup_instructions: "",
};

const EMPTY_PRACTICES = {
  noSyntheticPesticides: false, noGMO: false, regenerativeFarming: false,
  pastureRaised: false, grassFed: false, freeRange: false,
  humaneCertified: false, smallBatch: false,
};

export default function StoreEditorPage() {
  const [session, setSession] = useState<{ access_token: string; seller_id: string } | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]   = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("branding");

  // ── Branding / basic form ──────────────────────────────────────────────────
  const [form, setForm]           = useState<StoreForm>(EMPTY_FORM);
  const [logoUrl, setLogoUrl]     = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [shopBannerUrl, setShopBannerUrl]         = useState("");
  const [shopBannerTitle, setShopBannerTitle]     = useState("");
  const [shopBannerSubtitle, setShopBannerSubtitle] = useState("");
  const [uploadingLogo, setUploadingLogo]         = useState(false);
  const [uploadingBanner, setUploadingBanner]     = useState(false);
  const [uploadingShopBanner, setUploadingShopBanner] = useState(false);

  // ── Home page ──────────────────────────────────────────────────────────────
  const [heroText, setHeroText]           = useState("");
  const [heroSubtext, setHeroSubtext]     = useState("");
  const [missionTitle, setMissionTitle]   = useState("");
  const [missionText, setMissionText]     = useState("");
  const [whoWeAreTitle, setWhoWeAreTitle] = useState("");
  const [whoWeAreText, setWhoWeAreText]   = useState("");
  const [whoWeAreImageUrl, setWhoWeAreImageUrl]       = useState("");
  const [uploadingWhoWeAreImage, setUploadingWhoWeAreImage] = useState(false);

  // ── About Us page ──────────────────────────────────────────────────────────
  const [aboutPageBannerUrl, setAboutPageBannerUrl] = useState("");
  const [uploadingAboutBanner, setUploadingAboutBanner] = useState(false);
  const [ourStoryTitle, setOurStoryTitle] = useState("");
  const [ourStoryText, setOurStoryText]   = useState("");
  const [farmingPractices, setFarmingPractices] = useState<Record<string, boolean>>(EMPTY_PRACTICES);

  // ── Blog ──────────────────────────────────────────────────────────────────
  const [blogPosts, setBlogPosts]           = useState<any[]>([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", excerpt: "", body: "", cover_image: "" });
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
  const [savingPost, setSavingPost]         = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  const saveField = useCallback(async (fields: object) => {
    const sess = await getValidSellerSession();
    if (!sess) return;
    await fetch(`${SUPABASE_URL}/rest/v1/sellers?id=eq.${sess.seller_id}`, {
      method: "PATCH",
      headers: { ...getHeaders(sess.access_token), Prefer: "return=representation" },
      body: JSON.stringify(fields),
    });
  }, [getHeaders]);

  // ── Fetch store data ──────────────────────────────────────────────────────
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
            farm_name:           store.farm_name           ?? "",
            tagline:             store.tagline             ?? "",
            description:         store.description         ?? "",
            location_address:    store.location_address    ?? "",
            city:                store.city                ?? "",
            state:               store.state               ?? "",
            zip_code:            store.zip_code            ?? "",
            phone:               store.phone               ?? "",
            email:               store.email               ?? "",
            website:             store.website             ?? "",
            instagram_url:       store.instagram_url       ?? "",
            facebook_url:        store.facebook_url        ?? "",
            twitter_url:         store.twitter_url         ?? "",
            year_established:    store.year_established    ?? "",
            farm_size:           store.farm_size           ?? "",
            pickup_address:      store.pickup_address      ?? "",
            pickup_hours:        store.pickup_hours        ?? "",
            pickup_instructions: store.pickup_instructions ?? "",
          });
          setLogoUrl(store.logo_url                         ?? "");
          setBannerUrl(store.banner_url                     ?? "");
          setShopBannerUrl(store.shop_banner_url             ?? "");
          setShopBannerTitle(store.shop_banner_title         ?? "");
          setShopBannerSubtitle(store.shop_banner_subtitle   ?? "");
          setHeroText(store.hero_text                        ?? "");
          setHeroSubtext(store.hero_subtext                  ?? "");
          setMissionTitle(store.mission_title                ?? "");
          setMissionText(store.mission_text                  ?? "");
          setWhoWeAreTitle(store.who_we_are_title            ?? "");
          setWhoWeAreText(store.who_we_are_text              ?? "");
          setWhoWeAreImageUrl(store.who_we_are_image_url     ?? "");
          setAboutPageBannerUrl(store.about_page_banner_url  ?? "");
          setOurStoryTitle(store.our_story_title             ?? "");
          setOurStoryText(store.our_story_text               ?? "");
          setFarmingPractices(store.farming_practices ?? EMPTY_PRACTICES);
        }

        // Fetch blog posts
        const blogRes = await fetch(
          `${SUPABASE_URL}/rest/v1/farm_posts?seller_id=eq.${sess.seller_id}&select=*&order=created_at.desc`,
          { headers: getHeaders(sess.access_token) }
        );
        const blogData = await blogRes.json();
        setBlogPosts(Array.isArray(blogData) ? blogData : []);
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

  // ── Save all ──────────────────────────────────────────────────────────────
  const saveStoreData = async () => {
    const sess = await getValidSellerSession();
    if (!sess) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?id=eq.${sess.seller_id}`,
        {
          method: "PATCH",
          headers: { ...getHeaders(sess.access_token), Prefer: "return=representation" },
          body: JSON.stringify({
            farm_name: form.farm_name, tagline: form.tagline, description: form.description,
            location_address: form.location_address, city: form.city, state: form.state, zip_code: form.zip_code,
            phone: form.phone, email: form.email, website: form.website,
            instagram_url: form.instagram_url, facebook_url: form.facebook_url, twitter_url: form.twitter_url,
            year_established: form.year_established, farm_size: form.farm_size,
            pickup_address: form.pickup_address, pickup_hours: form.pickup_hours, pickup_instructions: form.pickup_instructions,
            logo_url: logoUrl, banner_url: bannerUrl,
            shop_banner_url: shopBannerUrl, shop_banner_title: shopBannerTitle, shop_banner_subtitle: shopBannerSubtitle,
            hero_text: heroText, hero_subtext: heroSubtext,
            mission_title: missionTitle, mission_text: missionText,
            who_we_are_title: whoWeAreTitle, who_we_are_text: whoWeAreText, who_we_are_image_url: whoWeAreImageUrl,
            about_page_banner_url: aboutPageBannerUrl,
            our_story_title: ourStoryTitle, our_story_text: ourStoryText,
            farming_practices: farmingPractices,
            updated_at: new Date().toISOString(),
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

  // ── Upload image ──────────────────────────────────────────────────────────
  const uploadImage = async (
    file: File,
    type: "logo" | "banner" | "shop-banner" | "who-we-are" | "about-banner" | "blog-image"
  ) => {
    const sess = await getValidSellerSession();
    if (!sess) return;
    const isLogo        = type === "logo";
    const isShopBanner  = type === "shop-banner";
    const isWhoWeAre    = type === "who-we-are";
    const isAboutBanner = type === "about-banner";
    const isBlogImage   = type === "blog-image";

    if (isLogo)        setUploadingLogo(true);
    else if (isShopBanner)  setUploadingShopBanner(true);
    else if (isWhoWeAre)    setUploadingWhoWeAreImage(true);
    else if (isAboutBanner) setUploadingAboutBanner(true);
    else if (isBlogImage)   setUploadingBlogImage(true);
    else setUploadingBanner(true);

    try {
      const ext    = file.name.split(".").pop();
      const bucket = isLogo ? "seller-logos" : isBlogImage ? "post-images" : "seller-banners";
      const fileName = `${sess.seller_id}-${type}-${Date.now()}.${ext}`;

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${sess.access_token}`,
            "Content-Type": file.type,
            "x-upsert": "true",
          },
          body: file,
        }
      );

      if (!uploadRes.ok) { flash("error", `Upload failed: ${await uploadRes.text()}`); return; }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;

      if (isLogo)            { setLogoUrl(publicUrl);           await saveField({ logo_url: publicUrl }); }
      else if (isShopBanner) { setShopBannerUrl(publicUrl);     await saveField({ shop_banner_url: publicUrl }); }
      else if (isWhoWeAre)   { setWhoWeAreImageUrl(publicUrl);  await saveField({ who_we_are_image_url: publicUrl }); }
      else if (isAboutBanner){ setAboutPageBannerUrl(publicUrl); await saveField({ about_page_banner_url: publicUrl }); }
      else if (isBlogImage)  { setNewPost(p => ({ ...p, cover_image: publicUrl })); }
      else                   { setBannerUrl(publicUrl);          await saveField({ banner_url: publicUrl }); }

      if (!isBlogImage) {
        flash("success", `${isLogo ? "Logo" : isShopBanner ? "Shop banner" : isWhoWeAre ? "Section image" : isAboutBanner ? "About banner" : "Banner"} uploaded!`);
      }
    } catch (err: unknown) {
      flash("error", "Upload error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (isLogo)        setUploadingLogo(false);
      else if (isShopBanner)  setUploadingShopBanner(false);
      else if (isWhoWeAre)    setUploadingWhoWeAreImage(false);
      else if (isAboutBanner) setUploadingAboutBanner(false);
      else if (isBlogImage)   setUploadingBlogImage(false);
      else setUploadingBanner(false);
    }
  };

  const set = (key: keyof StoreForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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

        {/* Toasts */}
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
                    className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === t
                        ? "border-[#1a4a2e] text-[#1a4a2e]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {TAB_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* ── BRANDING ── */}
              {activeTab === "branding" && (
                <div className="p-6 space-y-6">
                  {/* Store Banner */}
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
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                        <input type="text" value={shopBannerTitle} onChange={e => setShopBannerTitle(e.target.value)}
                          className={INPUT} placeholder="e.g. Blessings Ranch Shop"/>
                        <p className="text-xs text-gray-400 mt-1">Leave blank to use your farm name + Shop</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Subtitle</label>
                        <input type="text" value={shopBannerSubtitle} onChange={e => setShopBannerSubtitle(e.target.value)}
                          className={INPUT} placeholder="e.g. Fresh natural products straight from our farm"/>
                        <p className="text-xs text-gray-400 mt-1">Leave blank to hide the subtitle</p>
                      </div>
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="pt-2 border-t border-gray-100">
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
                    <textarea value={form.description} onChange={set("description")} rows={6}
                      placeholder="Tell customers about your farm, your practices and what makes you unique..."
                      className={INPUT + " resize-none"}/>
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
                      <textarea value={form.pickup_instructions} onChange={set("pickup_instructions")} rows={3}
                        placeholder="Enter through the main gate, parking available on the left..."
                        className={INPUT + " resize-none"}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SOCIAL ── */}
              {activeTab === "social" && (
                <div className="p-6 space-y-4">
                  {[
                    { key: "instagram_url" as keyof StoreForm, label: "Instagram URL", placeholder: "https://instagram.com/yourfarm" },
                    { key: "facebook_url"  as keyof StoreForm, label: "Facebook URL",  placeholder: "https://facebook.com/yourfarm" },
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

              {/* ── HOME PAGE ── */}
              {activeTab === "homepage" && (
                <div className="p-6 space-y-6">

                  {/* Hero Banner Text */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Hero Banner Text</p>
                    <p className="text-xs text-gray-400 mb-3">Text that appears overlaid on your main store banner image</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                        <input type="text" value={heroText} onChange={e => setHeroText(e.target.value)}
                          className={INPUT} placeholder="e.g. Welcome to Blessings Ranch"/>
                        <p className="text-xs text-gray-400 mt-1">Leave blank to show your farm name by default</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                        <input type="text" value={heroSubtext} onChange={e => setHeroSubtext(e.target.value)}
                          className={INPUT} placeholder="e.g. Where Quality Meets Community"/>
                      </div>
                    </div>
                  </div>

                  {/* Mission Section */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Mission Section</p>
                    <p className="text-xs text-gray-400 mb-3">The centered text section below your bestsellers</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                        <input type="text" value={missionTitle} onChange={e => setMissionTitle(e.target.value)}
                          className={INPUT} placeholder="e.g. Our Mission"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Text</label>
                        <textarea value={missionText} onChange={e => setMissionText(e.target.value)} rows={4}
                          className={INPUT + " resize-none"} placeholder="Tell customers about your mission and values..."/>
                      </div>
                    </div>
                  </div>

                  {/* Who We Are Section */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Who We Are Section</p>
                    <p className="text-xs text-gray-400 mb-3">The two column section with image and text</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                        <input type="text" value={whoWeAreTitle} onChange={e => setWhoWeAreTitle(e.target.value)}
                          className={INPUT} placeholder="e.g. WHO WE ARE AND WHAT WE DO"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Text</label>
                        <textarea value={whoWeAreText} onChange={e => setWhoWeAreText(e.target.value)} rows={5}
                          className={INPUT + " resize-none"} placeholder="Tell your story here..."/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Section Image</label>
                        <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 mb-3 flex items-center justify-center relative">
                          {whoWeAreImageUrl ? (
                            <Image src={whoWeAreImageUrl} alt="Who we are" fill className="object-cover"/>
                          ) : (
                            <p className="text-xs text-gray-400">No image uploaded</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                            {uploadingWhoWeAreImage ? "Uploading..." : "Upload Image"}
                            <input type="file" accept="image/*" className="hidden"
                              disabled={uploadingWhoWeAreImage}
                              onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "who-we-are")}/>
                          </label>
                          {whoWeAreImageUrl && (
                            <button onClick={() => setWhoWeAreImageUrl("")} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ABOUT US PAGE ── */}
              {activeTab === "aboutpage" && (
                <div className="p-6 space-y-6">

                  {/* About Page Banner */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">About Us Page Banner</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Banner at the top of your About Us page. Falls back to main store banner if not uploaded.
                    </p>
                    <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center mb-3 relative">
                      {aboutPageBannerUrl ? (
                        <Image src={aboutPageBannerUrl} alt="About page banner" fill className="object-cover"/>
                      ) : bannerUrl ? (
                        <>
                          <Image src={bannerUrl} alt="Using main banner" fill className="object-cover opacity-40"/>
                          <span className="relative z-10 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">Using main store banner</span>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">No banner uploaded</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        {uploadingAboutBanner ? "Uploading..." : "Upload About Page Banner"}
                        <input type="file" accept="image/*" className="hidden"
                          disabled={uploadingAboutBanner}
                          onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "about-banner")}/>
                      </label>
                      {aboutPageBannerUrl && (
                        <button onClick={() => setAboutPageBannerUrl("")} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                      )}
                    </div>
                  </div>

                  {/* Our Story */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Our Story</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Story Title</label>
                        <input type="text" value={ourStoryTitle} onChange={e => setOurStoryTitle(e.target.value)}
                          className={INPUT} placeholder="e.g. Our Story"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Story Text</label>
                        <textarea value={ourStoryText} onChange={e => setOurStoryText(e.target.value)} rows={8}
                          className={INPUT + " resize-none"} placeholder="Tell the full story of your farm..."/>
                      </div>
                    </div>
                  </div>

                  {/* Farming Practices */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Farming Practices</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Check all that apply. These appear as verified badges on your About Us page.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {FARMING_PRACTICE_OPTIONS.map(p => (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-gray-200 hover:border-[#1a4a2e] transition-colors">
                          <input
                            type="checkbox"
                            checked={farmingPractices[p.key] ?? false}
                            onChange={e => setFarmingPractices(prev => ({ ...prev, [p.key]: e.target.checked }))}
                            className="accent-[#1a4a2e] w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── BLOG ── */}
              {activeTab === "blog" && (
                <div className="p-6 space-y-6">

                  {/* Header row */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Blog Posts</p>
                      <p className="text-xs text-gray-400 mt-0.5">Share stories, updates and education from your farm</p>
                    </div>
                    <button
                      onClick={() => setShowNewPostForm(!showNewPostForm)}
                      className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                      {showNewPostForm ? "Cancel" : "+ New Post"}
                    </button>
                  </div>

                  {/* New Post Form */}
                  {showNewPostForm && (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                      <p className="text-sm font-semibold text-gray-800 mb-4">Create New Blog Post</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                          <input type="text" value={newPost.title}
                            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                            className={INPUT} placeholder="e.g. A Day in the Life on Our Farm"/>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Short Excerpt</label>
                          <input type="text" value={newPost.excerpt}
                            onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })}
                            className={INPUT} placeholder="A short summary of your post..."/>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Post Content</label>
                          <textarea value={newPost.body}
                            onChange={e => setNewPost({ ...newPost, body: e.target.value })}
                            rows={8} className={INPUT + " resize-none"}
                            placeholder="Write your full blog post here..."/>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Post Image</label>
                          <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 mb-3 flex items-center justify-center relative">
                            {newPost.cover_image ? (
                              <Image src={newPost.cover_image} alt="Post" fill className="object-cover"/>
                            ) : (
                              <p className="text-xs text-gray-400">No image uploaded</p>
                            )}
                          </div>
                          <label className="cursor-pointer bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                            {uploadingBlogImage ? "Uploading..." : "Upload Image"}
                            <input type="file" accept="image/*" className="hidden"
                              disabled={uploadingBlogImage}
                              onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "blog-image")}/>
                          </label>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={async () => {
                              if (!newPost.title) { flash("error", "Please add a title"); return; }
                              if (!session) return;
                              setSavingPost(true);
                              try {
                                const res = await fetch(`${SUPABASE_URL}/rest/v1/farm_posts`, {
                                  method: "POST",
                                  headers: { ...getHeaders(session.access_token), Prefer: "return=representation" },
                                  body: JSON.stringify({
                                    seller_id: session.seller_id,
                                    title: newPost.title,
                                    slug: `${newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`,
                                    excerpt: newPost.excerpt || '',
                                    body: newPost.body || '',
                                    cover_image: newPost.cover_image || null,
                                    published: true,
                                    published_at: new Date().toISOString(),
                                    tags: [],
                                  }),
                                });
                                if (res.ok) {
                                  const saved = await res.json();
                                  setBlogPosts(prev => [saved[0], ...prev]);
                                  setNewPost({ title: "", excerpt: "", body: "", cover_image: "" });
                                  setShowNewPostForm(false);
                                  flash("success", "Blog post published!");
                                } else {
                                  flash("error", "Error saving post: " + await res.text());
                                }
                              } catch (err: unknown) {
                                flash("error", "Error: " + (err instanceof Error ? err.message : String(err)));
                              } finally {
                                setSavingPost(false);
                              }
                            }}
                            disabled={savingPost}
                            className="bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            {savingPost ? "Publishing..." : "Publish Post"}
                          </button>
                          <button
                            onClick={() => { setNewPost({ title: "", excerpt: "", body: "", cover_image: "" }); setShowNewPostForm(false); }}
                            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-xl text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing posts */}
                  {blogPosts.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-10 text-center">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="font-semibold text-gray-700">No blog posts yet</p>
                      <p className="text-xs text-gray-400 mt-1">Share your farm story with customers</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post: any) => (
                        <div key={post.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3 min-w-0">
                              {post.cover_image && (
                                <img src={post.cover_image} alt={post.title}
                                  className="w-16 h-16 rounded-lg object-cover shrink-0"/>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{post.title || "Untitled"}</p>
                                {post.excerpt && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{post.excerpt}</p>}
                                <p className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-1 rounded-full ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {post.published ? "Published" : "Draft"}
                              </span>
                              <button
                                onClick={async () => {
                                  if (!session) return;
                                  if (!confirm("Delete this post?")) return;
                                  await fetch(`${SUPABASE_URL}/rest/v1/farm_posts?id=eq.${post.id}`, {
                                    method: "DELETE",
                                    headers: getHeaders(session.access_token),
                                  });
                                  setBlogPosts(prev => prev.filter(p => p.id !== post.id));
                                }}
                                className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-lg"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {form.description && <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{form.description}</p>}
                  {locationDisplay && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {locationDisplay}
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
