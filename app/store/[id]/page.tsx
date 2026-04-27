"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreHero from "@/components/store/StoreHero";
import Bestsellers from "@/components/store/Bestsellers";
import AboutSection from "@/components/store/AboutSection";
import WhoWeAre from "@/components/store/WhoWeAre";
import StoreReviews from "@/components/store/StoreReviews";
import DiscoverMore from "@/components/store/DiscoverMore";
import { fetchFromSupabase } from "@/lib/api";

interface Seller {
  id: string;
  farm_name: string;
  description: string;
  city: string;
  state: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

interface StorePageProps {
  params: { id: string };
}

export default function StorePage({ params }: StorePageProps) {
  const { id } = params;
  const [seller, setSeller]   = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sellers = await fetchFromSupabase<Seller[]>(
          `sellers?slug=eq.${id}&status=eq.approved&select=id,farm_name,description,city,state,slug`
        );

        if (!sellers?.length) return;
        const sellerData = sellers[0];
        setSeller(sellerData);

        const productsData = await fetchFromSupabase<Product[]>(
          `products?seller_id=eq.${sellerData.id}&status=eq.active&select=id,name,description,price,images&limit=8`
        );

        if (productsData?.length) setProducts(productsData);
      } catch (err) {
        console.error("StorePage load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <StoreNavbar storeId={id} />
      <main className="flex-1">
        <StoreHero storeId={id} seller={seller} />
        <Bestsellers products={products} />
        <AboutSection />
        <WhoWeAre />
        <StoreReviews />
        <DiscoverMore />
      </main>
      <Footer />
    </div>
  );
}
