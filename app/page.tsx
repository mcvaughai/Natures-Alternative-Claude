import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/marketplace/HeroBanner";
import PopularProducts from "@/components/marketplace/PopularProducts";
import SpecialDeals from "@/components/marketplace/SpecialDeals";
import FeaturedStores from "@/components/marketplace/FeaturedStores";
import CategorySearch from "@/components/marketplace/CategorySearch";
import BuyAgain from "@/components/marketplace/BuyAgain";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1 pb-8">
        <HeroBanner />
        <PopularProducts />
        <SpecialDeals />
        <FeaturedStores />
        <CategorySearch />
        <BuyAgain />
      </main>
      <Footer />
    </div>
  );
}
