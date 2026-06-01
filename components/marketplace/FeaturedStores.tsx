"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import FarmCard, { FarmCardData } from "@/components/shared/FarmCard";
import { SUPABASE_URL, supabaseHeaders } from "@/lib/api";

function mapFulfillment(raw: string[] | null): string[] {
  return (raw ?? []).map((f) => {
    if (f === "Local Delivery") return "Delivery";
    if (f === "Farm Pickup")   return "Pickup";
    if (f === "Shipping")      return "Ships";
    return f;
  });
}

export default function FeaturedStores() {
  const [farms, setFarms] = useState<FarmCardData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        // Step 1: fetch approved sellers with banner
        const sellersRes = await fetch(
          `${SUPABASE_URL}/rest/v1/sellers?status=eq.approved&select=id,slug,farm_name,city,state,description,fulfillment,banner_url,logo_url&limit=4`,
          { headers: supabaseHeaders }
        );
        const sellers = await sellersRes.json();
        if (!Array.isArray(sellers) || sellers.length === 0) return;

        const sellerIds: string[] = sellers.map((s: any) => s.id);

        // Step 2: fetch active products for all these sellers
        const idFilter = sellerIds.map((id) => `seller_id=eq.${id}`).join(",");
        const productsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/products?status=eq.active&or=(${idFilter})&select=id,seller_id,category_id`,
          { headers: supabaseHeaders }
        );
        const productsData = await productsRes.json();

        // Step 3: fetch all categories for name lookup
        const catsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=id,name`,
          { headers: supabaseHeaders }
        );
        const catsData = await catsRes.json();
        const catsMap: Record<string, string> = {};
        if (Array.isArray(catsData)) {
          catsData.forEach((c: any) => { catsMap[c.id] = c.name; });
        }

        // Step 4: aggregate product count + category ids per seller
        const productsBySeller: Record<string, { count: number; categoryIds: Set<string> }> = {};
        if (Array.isArray(productsData)) {
          productsData.forEach((p: any) => {
            if (!productsBySeller[p.seller_id]) {
              productsBySeller[p.seller_id] = { count: 0, categoryIds: new Set() };
            }
            productsBySeller[p.seller_id].count++;
            if (p.category_id) {
              productsBySeller[p.seller_id].categoryIds.add(p.category_id);
            }
          });
        }

        // Step 5: build FarmCardData with real values
        const farmCards: FarmCardData[] = sellers.map((seller: any) => {
          const sellerProducts = productsBySeller[seller.id] ?? { count: 0, categoryIds: new Set() };
          const categories = [...sellerProducts.categoryIds]
            .map((id) => catsMap[id])
            .filter(Boolean)
            .slice(0, 3);

          return {
            id:           seller.slug,
            name:         seller.farm_name,
            location:     [seller.city, seller.state].filter(Boolean).join(", "),
            description:  seller.description ?? "",
            bannerUrl:    seller.banner_url ?? "",
            rating:       0,
            reviewCount:  0,
            productCount: sellerProducts.count,
            categories,
            fulfillment:  mapFulfillment(seller.fulfillment),
            featured:     false,
          };
        });

        setFarms(farmCards);
      } catch (err) {
        console.error("FeaturedStores fetch error:", err);
      }
    }
    load();
  }, []);

  if (farms.length === 0) return null;

  return (
    <section className="w-full px-6 py-4">
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
