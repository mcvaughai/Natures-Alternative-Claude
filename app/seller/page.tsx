import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SellerLandingSection from "@/components/seller/SellerLandingSection";

export default function SellerLandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <SellerLandingSection />
      </main>
      <Footer />
    </div>
  );
}
