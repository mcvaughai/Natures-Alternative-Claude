"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import FarmCard, { FarmCardData } from "@/components/shared/FarmCard";
import { supabase } from "@/lib/supabase";

function mapFulfillment(raw: string[] | null): string[] {
  return (raw ?? []).map((f) => {
    if (f === "Local Delivery") return "Delivery";
    if (f === "Farm Pickup") return "Pickup";
    if (f === "Shipping") return "Ships";
    return f;
  });
}

export default function FeaturedStores() {
  const [farms, setFarms] = useState<FarmCardData[]>([]);

  useEffect(() => {
    supabase
      .from("sellers")
      .select("slug, farm_name, city, state, description, fulfillment")
      .eq("status", "approved")
      .limit(4)
      .then(({ data }) => {
        if (!data) return;
        setFarms(
          data.map((s) => ({
            id:           s.slug,
            name:         s.farm_name,
            location:     [s.city, s.state].filter(Boolean).join(", "),
            description:  s.description ?? "",
            categories:   [],
            fulfillment:  mapFulfillment(s.fulfillment),
            rating:       0,
            reviewCount:  0,
            productCount: 0,
          }))
        );
      });
  }, []);

  if (farms.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="Featured Farms" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {farms.map((farm) => (
          <FarmCard key={farm.id} {...farm} />
        ))}
      </div>
      <div className="text-center mt-6">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 border-2 border-[#1a4a2e] text-[#1a4a2e] hover:bg-[#1a4a2e] hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Browse All Farms
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
