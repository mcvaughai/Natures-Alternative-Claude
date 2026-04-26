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
import { supabase } from "@/lib/supabase";

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
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const { data: sellerData } = await supabase
        .from("sellers")
        .select("id, farm_name, description, city, state, slug")
        .eq("slug", id)
        .single();

      if (!sellerData) return;
      setSeller(sellerData);

      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, description, price, images")
        .eq("seller_id", sellerData.id)
        .eq("status", "active")
        .limit(8);

      if (productsData) setProducts(productsData);
    }
    load();
  }, [id]);

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
