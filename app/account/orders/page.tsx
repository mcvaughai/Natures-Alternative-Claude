import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import OrdersSection from "@/components/account/OrdersSection";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
            <AccountSidebar />
            <OrdersSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
