import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutSection from "@/components/checkout/CheckoutSection";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FCF7F4] flex flex-col">
      <Navbar />
      <main className="flex-1 pb-8">
        <CheckoutSection />
      </main>
      <Footer />
    </div>
  );
}
