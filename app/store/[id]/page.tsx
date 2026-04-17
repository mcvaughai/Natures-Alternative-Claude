import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreHero from "@/components/store/StoreHero";
import Bestsellers from "@/components/store/Bestsellers";
import AboutSection from "@/components/store/AboutSection";
import WhoWeAre from "@/components/store/WhoWeAre";
import StoreReviews from "@/components/store/StoreReviews";
import DiscoverMore from "@/components/store/DiscoverMore";

interface StorePageProps {
  params: { id: string };
}

export default function StorePage({ params }: StorePageProps) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      {/* Main marketplace navbar */}
      <Navbar />

      {/* Store-specific secondary navbar */}
      <StoreNavbar storeId={id} />

      <main className="flex-1">
        <StoreHero storeId={id} />
        <Bestsellers />
        <AboutSection />
        <WhoWeAre />
        <StoreReviews />
        <DiscoverMore />
      </main>

      <Footer />
    </div>
  );
}
