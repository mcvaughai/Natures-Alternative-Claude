import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSection from "@/components/cart/CartSection";
import DiscountedItems from "@/components/cart/DiscountedItems";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1 pb-8">
        <CartSection />
        <DiscountedItems />
      </main>
      <Footer />
    </div>
  );
}
