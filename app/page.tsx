"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedStores from "@/components/marketplace/FeaturedStores";
import PopularProducts from "@/components/marketplace/PopularProducts";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export default function HomePage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [heroBgUrl, setHeroBgUrl] = useState<string | null>(null);
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(0.75);

  useEffect(() => {
    fetchBanners();
    fetchHeroBg();
  }, []);

  async function fetchBanners() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/homepage_banners?is_active=eq.true&title=neq.hero&select=*&order=position.asc`,
        { headers }
      );
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching banners:", err);
    }
  }

  async function fetchHeroBg() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/homepage_banners?title=eq.hero&is_active=eq.true&select=background_image_url,overlay_opacity`,
        { headers }
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        if (data[0].background_image_url) setHeroBgUrl(data[0].background_image_url);
        if (data[0].overlay_opacity != null) setHeroOverlayOpacity(Number(data[0].overlay_opacity));
      }
    } catch (err) {
      console.error("Error fetching hero bg:", err);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── SECTION 1 — Hero Banner ───────────────────────────── */}
      <div
        className="relative w-full flex items-center"
        style={{
          minHeight: "580px",
          background: heroBgUrl
            ? `url(${heroBgUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #053D2D 0%, #00674B 50%, #1a5c3a 100%)",
        }}
      >
        {/* Dark overlay when background image is set, otherwise subtle pattern */}
        {heroBgUrl ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(5, 61, 45, ${heroOverlayOpacity})` }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        )}

        <div className="relative z-10 w-full px-12 py-16 flex items-center justify-between">
          {/* Left — Text */}
          <div className="max-w-2xl">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-medium mb-6"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              🌱 Farm to Table Marketplace
            </div>
            <h1
              className="font-raleway font-bold text-white leading-tight mb-4"
              style={{ fontSize: "56px", lineHeight: "1.1" }}
            >
              Farm Fresh.
              <br />
              <span style={{ color: "#86efac" }}>Straight to You.</span>
            </h1>
            <p
              className="text-white mb-8 leading-relaxed"
              style={{ fontSize: "18px", opacity: 0.85, maxWidth: "520px" }}
            >
              Discover local farms and get the freshest natural food straight
              from the source. No middlemen. No compromises. Just pure food the
              way nature intended.
            </p>
            <div className="flex gap-4">
              <Link
                href="/explore"
                className="inline-block px-8 py-4 rounded-full text-green-900 font-bold text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#ffffff" }}
              >
                Shop Now
              </Link>
              <Link
                href="/farms"
                className="inline-block px-8 py-4 rounded-full font-bold text-lg border-2 border-white text-white hover:bg-white hover:text-green-900 transition-all"
              >
                Find Farms Near You
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-10">
              {[
                { icon: "🏪", label: "Local",    sub: "Farms"          },
                { icon: "🌿", label: "Natural",   sub: "Products"       },
                { icon: "🚗", label: "Pickup",    sub: "& Delivery"     },
                { icon: "💚", label: "Support",   sub: "Local Farmers"  },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <div className="w-px h-8 bg-white opacity-20 -ml-3 mr-1" />}
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">{item.label}</p>
                    <p className="text-white text-xs opacity-70">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Decorative product cards */}
          <div className="hidden lg:flex flex-col gap-4 flex-shrink-0">
            {[
              { emoji: "🥩", bg: "#f0fdf4", name: "Grass-Fed Beef",       seller: "Blessings Ranch",    price: "$29.99/lb"  },
              { emoji: "🍯", bg: "#fefce8", name: "Raw Honey",             seller: "Victorias Natural",  price: "$18.00/jar" },
              { emoji: "🍦", bg: "#fdf2f8", name: "Raw Milk Ice Cream",    seller: "Happy Cow",          price: "$12.00/pint" },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-xl"
                style={{ width: "200px", marginLeft: i === 1 ? "32px" : "0" }}
              >
                <div
                  className="w-full h-24 rounded-xl mb-3 flex items-center justify-center text-4xl"
                  style={{ backgroundColor: card.bg }}
                >
                  {card.emoji}
                </div>
                <p className="font-raleway font-bold text-gray-900 text-sm">{card.name}</p>
                <p className="text-xs text-gray-500">{card.seller}</p>
                <p className="font-bold mt-1" style={{ color: "#053D2D", fontSize: "14px" }}>
                  {card.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2 — Promo Banners (from Supabase) ────────── */}
      {banners.length > 0 && (
        <div className="w-full px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            {banners.map((banner: any) => (
              <Link
                key={banner.id}
                href={banner.link_url || "/explore"}
                className="relative overflow-hidden rounded-xl group cursor-pointer"
                style={{
                  backgroundColor: banner.background_color || "#053D2D",
                  minHeight: "130px",
                  backgroundImage: banner.background_image_url
                    ? `url(${banner.background_image_url})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {banner.background_image_url && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
                  />
                )}
                <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                  <div>
                    {banner.badge_text && (
                      <span
                        className="inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                        style={{ backgroundColor: banner.badge_color || "#16a34a" }}
                      >
                        {banner.badge_text}
                      </span>
                    )}
                    <h3 className="font-raleway font-bold text-lg leading-tight text-white">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-sm mt-1 text-white opacity-80">{banner.subtitle}</p>
                    )}
                  </div>
                  <div className="mt-3">
                    <span
                      className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-white"
                      style={{ color: banner.background_color || "#053D2D" }}
                    >
                      {banner.link_text || "Shop Now"} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3 — Featured Farms ───────────────────────── */}
      {/* FeaturedStores renders its own "Featured Farms" header + "Browse All Farms" link */}
      <div className="w-full py-4">
        <FeaturedStores />
      </div>

      {/* ── SECTION 4 — Popular Products ─────────────────────── */}
      <div style={{ backgroundColor: "#f9fafb" }} className="py-8">
        <PopularProducts />
      </div>

      {/* ── SECTION 5 — How It Works ─────────────────────────── */}
      <div className="w-full px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Getting farm fresh food has never been easier. Three simple steps
            to fresher, healthier eating.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "01", icon: "🔍",
              title: "Find Local Farms",
              description: "Browse farms in your area growing natural, sustainable food. Read their story and see what they offer.",
            },
            {
              step: "02", icon: "🛒",
              title: "Browse & Order",
              description: "Shop directly from farmers at fair prices. No middlemen means better prices for everyone.",
            },
            {
              step: "03", icon: "🚗",
              title: "Farm Fresh Pickup",
              description: "Choose farm pickup, local delivery or shipping. Get your food fresher than any grocery store.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                {item.icon}
              </div>
              <div className="text-xs font-bold mb-2 tracking-wider" style={{ color: "#00674B" }}>
                STEP {item.step}
              </div>
              <h3 className="font-raleway font-bold text-gray-900 text-xl mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/explore"
            className="inline-block px-8 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#053D2D" }}
          >
            Start Shopping
          </Link>
        </div>
      </div>

      {/* ── SECTION 6 — Why Natures Alternative ──────────────── */}
      <div className="w-full px-6 py-16" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="max-w-5xl mx-auto flex gap-12 items-center">
          {/* Visual panel */}
          <div className="flex-1">
            <div
              className="w-full rounded-2xl flex items-center justify-center"
              style={{ height: "400px", backgroundColor: "#053D2D" }}
            >
              <div className="text-center px-8">
                <div className="text-7xl mb-4">🌿</div>
                <p className="font-raleway font-bold text-white text-2xl mb-2">
                  Pure. Natural. Local.
                </p>
                <p className="text-white opacity-70 text-sm">
                  Food the way nature intended
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="text-sm font-bold tracking-wider mb-3" style={{ color: "#00674B" }}>
              WHY NATURES ALTERNATIVE
            </div>
            <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Why Buy Direct
              <br />
              From Farms?
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              The modern food system puts too many hands between the farmer and
              your plate. We&apos;re changing that.
            </p>
            <div className="space-y-4">
              {[
                { icon: "💰", title: "Better Prices For Everyone",   desc: "No middlemen means farmers earn more and you pay less." },
                { icon: "🔍", title: "Full Transparency",            desc: "Know exactly where your food comes from and how it was grown." },
                { icon: "🌱", title: "Support Sustainable Farming",  desc: "Every purchase supports local farms practicing sustainable agriculture." },
                { icon: "⚡", title: "Fresher Than Any Store",       desc: "Harvested to order means food that is days not weeks old." },
                { icon: "🤝", title: "Real Relationships",           desc: "Build a direct relationship with the farmer who grows your food." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: "#dcfce7" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 7 — Shop By Category ─────────────────────── */}
      <div className="w-full px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-2">
            Shop By Category
          </h2>
          <p className="text-gray-500">Find exactly what you&apos;re looking for</p>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[
            { name: "Meat & Poultry",      icon: "🥩", slug: "meat-poultry",      color: "#fef2f2" },
            { name: "Dairy & Eggs",        icon: "🥛", slug: "dairy-eggs",        color: "#eff6ff" },
            { name: "Fruits & Vegetables", icon: "🥦", slug: "fruits-vegetables", color: "#f0fdf4" },
            { name: "Honey & Preserves",   icon: "🍯", slug: "honey-preserves",   color: "#fefce8" },
            { name: "Bakery & Breads",     icon: "🍞", slug: "bakery-breads",     color: "#fdf4ff" },
            { name: "Seafood",             icon: "🐟", slug: "seafood",           color: "#f0f9ff" },
            { name: "Herbs & Botanicals",  icon: "🌿", slug: "herbs-botanicals",  color: "#f0fdf4" },
            { name: "Natural Skincare",    icon: "🧴", slug: "natural-skincare",  color: "#fdf2f8" },
            { name: "Candles & Home",      icon: "🕯️", slug: "candles-home",      color: "#fffbeb" },
            { name: "Natural Cleaning",    icon: "🧼", slug: "natural-cleaning",  color: "#f0fdfa" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center p-4 rounded-xl hover:shadow-md transition-shadow group"
              style={{ backgroundColor: cat.color }}
            >
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">
                {cat.icon}
              </span>
              <p className="text-sm font-semibold text-gray-800 text-center leading-tight">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── SECTION 8 — Become a Seller CTA ──────────────────── */}
      <div className="px-6 pb-10">
        <div
          className="w-full rounded-2xl px-12 py-16"
          style={{ backgroundColor: "#053D2D" }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-8">
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mb-4"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                FOR FARMERS &amp; PRODUCERS
              </div>
              <h2 className="font-raleway text-3xl font-bold text-white mb-3">
                Are You a Farmer or
                <br />
                Natural Goods Producer?
              </h2>
              <p className="text-white mb-6 leading-relaxed" style={{ opacity: 0.8 }}>
                Join our growing marketplace and sell directly to conscious
                consumers in your area. No commissions on your first 3 months.
                Easy setup in minutes.
              </p>
              <div className="flex gap-6">
                {["✓ No upfront costs", "✓ Keep more of your profits", "✓ Built for farmers"].map(
                  (point) => (
                    <span key={point} className="text-sm text-white font-medium" style={{ opacity: 0.9 }}>
                      {point}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-3">
              <Link
                href="/seller/apply"
                className="inline-block px-8 py-4 rounded-full font-bold text-lg text-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#ffffff", color: "#053D2D" }}
              >
                Apply to Sell
              </Link>
              <Link
                href="/seller"
                className="inline-block px-8 py-3 rounded-full font-medium text-sm text-center border border-white text-white hover:bg-white hover:text-green-900 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
