"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const FALLBACK_BANNERS = [
  { id: "f1", title: "Fresh Produce Delivered Daily", subtitle: "Straight from the farm to your door", image_url: null, link_url: "/explore" },
  { id: "f2", title: "Seasonal Specials", subtitle: "Limited harvest — shop before it's gone", image_url: null, link_url: "/explore" },
  { id: "f3", title: "Farm-Fresh Meat & Dairy", subtitle: "Pasture-raised, antibiotic-free", image_url: null, link_url: "/explore" },
];

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  position: number;
}

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${SUPABASE_URL}/rest/v1/homepage_banners?is_active=eq.true&select=*&order=position.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then((r) => r.json())
      .then((data) => {
        setBanners(Array.isArray(data) && data.length > 0 ? data : FALLBACK_BANNERS as any);
      })
      .catch(() => setBanners(FALLBACK_BANNERS as any))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-52 sm:h-60" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {banners.map((banner) => {
          const inner = (
            <div className="relative rounded-2xl overflow-hidden h-52 sm:h-60 flex items-end cursor-pointer hover:opacity-90 transition-opacity bg-gray-300">
              {/* Background image or placeholder */}
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Text overlay */}
              <div className="relative z-10 w-full p-5 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-bold text-base sm:text-lg leading-tight font-raleway">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-white/80 text-xs mt-0.5 font-urbanist">{banner.subtitle}</p>
                )}
              </div>
            </div>
          );

          return banner.link_url ? (
            <Link key={banner.id} href={banner.link_url}>
              {inner}
            </Link>
          ) : (
            <div key={banner.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
