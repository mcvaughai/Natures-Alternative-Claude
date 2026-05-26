import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderConfirmationSection from "@/components/order-confirmation/OrderConfirmationSection";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pb-8">
        <OrderConfirmationSection />
      </main>
      <Footer />
    </div>
  );
}
