import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SellerApplicationForm from "@/components/seller/SellerApplicationForm";

export default function SellerApplyPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1 pb-12">
        <SellerApplicationForm />
      </main>
      <Footer />
    </div>
  );
}
