"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const FAQ_DATA = {
  shoppers: {
    label: "For Shoppers",
    items: [
      {
        id: "s1",
        q: "How does Natures Alternative work?",
        a: "Natures Alternative is a marketplace that connects you directly with local natural farms. Browse products, add to cart and purchase directly from the farm. You get fresh natural food, and farms get a direct path to consumers who care about quality.",
      },
      {
        id: "s2",
        q: "Do I need an account to shop?",
        a: "No! You can browse and purchase as a guest. Creating an account lets you track orders, save favorites and get personalized recommendations based on what you love.",
      },
      {
        id: "s3",
        q: "How are products delivered?",
        a: "Each farm sets their own fulfillment method. Options include farm pickup, local delivery or shipping depending on what the farm offers. You will see the available fulfillment options when checking out.",
      },
      {
        id: "s4",
        q: "Are all products natural and chemical free?",
        a: "Yes. Every farm on our platform is vetted to ensure they meet our natural farming standards including no synthetic pesticides, no GMOs and no monocrop practices. We review each farm before approving their application.",
      },
    ],
  },
  sellers: {
    label: "For Sellers",
    items: [
      {
        id: "v1",
        q: "How do I become a seller?",
        a: "Fill out our seller application at naturesalternative.com/seller. We review every application to ensure farms meet our natural farming standards. You will receive an email with our decision within 3-5 business days.",
      },
      {
        id: "v2",
        q: "How long does approval take?",
        a: "We review applications within 3-5 business days. You will receive an email with our decision and next steps. If approved, you will gain access to your seller dashboard where you can set up your store.",
      },
      {
        id: "v3",
        q: "What are the fees?",
        a: "We currently offer a free starter plan with an 8% transaction fee. Pro plans with reduced fees and additional features are coming soon. There are no monthly subscription fees on the starter plan.",
      },
      {
        id: "v4",
        q: "Who handles shipping and delivery?",
        a: "You do! As a seller you manage your own fulfillment. You set your fulfillment method, delivery radius and shipping zones in your seller dashboard. We provide the tools — you handle the logistics.",
      },
    ],
  },
  orders: {
    label: "Orders & Delivery",
    items: [
      {
        id: "o1",
        q: "How do I track my order?",
        a: "Once your order is confirmed you will receive an email with order details. You can also track your order from your account dashboard under My Orders. Each farm provides updates as your order is prepared and dispatched.",
      },
      {
        id: "o2",
        q: "Can I cancel my order?",
        a: "You can cancel your order within 1 hour of placing it. After that, the farm may have already begun preparing your order. Contact us at hello@naturesalternative.com and we will do our best to assist you.",
      },
      {
        id: "o3",
        q: "What is your refund policy?",
        a: "If your order arrives damaged, incorrect or does not meet the quality standards described, we will work with you to resolve it — either with a replacement or a full refund. Please contact us within 48 hours of receiving your order.",
      },
      {
        id: "o4",
        q: "How long does delivery take?",
        a: "Delivery times vary by farm and fulfillment method. Local deliveries are typically within 1-3 days. Farm pickups are available at the farm's scheduled pickup times. Shipping times depend on your location and the farm's shipping provider.",
      },
    ],
  },
  payments: {
    label: "Payments",
    items: [
      {
        id: "p1",
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards including Visa, Mastercard, American Express and Discover. We also support payments through Apple Pay and Google Pay where available.",
      },
      {
        id: "p2",
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed through our secure payment provider. We never store your full card details on our servers. All transactions are encrypted and comply with PCI DSS standards.",
      },
      {
        id: "p3",
        q: "When will I be charged?",
        a: "Your card is charged at the time you place your order. If your order cannot be fulfilled by the farm, you will receive a full refund within 3-5 business days depending on your bank.",
      },
      {
        id: "p4",
        q: "Do you offer refunds?",
        a: "Yes. If there is an issue with your order we will issue a full refund back to your original payment method. Refunds typically appear within 5-10 business days depending on your bank or card provider.",
      },
    ],
  },
};

type TabKey = "all" | "shoppers" | "sellers" | "orders" | "payments";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "shoppers", label: "For Shoppers" },
  { key: "sellers", label: "For Sellers" },
  { key: "orders", label: "Orders & Delivery" },
  { key: "payments", label: "Payments" },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const visibleSections = activeTab === "all"
    ? Object.entries(FAQ_DATA)
    : Object.entries(FAQ_DATA).filter(([key]) => key === activeTab);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-[#1a4a2e] py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
            <div className="relative max-w-lg mx-auto">
              <input
                type="search"
                placeholder="Search FAQs..."
                className="w-full rounded-full px-6 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
            </div>
          </div>
        </section>

        {/* ── Filter Tabs ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#1a4a2e] text-[#1a4a2e]"
                    : "border-transparent text-gray-500 hover:text-[#1a4a2e] hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FAQ Sections ─────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {visibleSections.map(([, section]) => (
            <div key={section.label}>
              <h2 className="text-2xl font-bold text-[#1a4a2e] mb-6">{section.label}</h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800 pr-4 text-sm sm:text-base">{item.q}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 text-[#1a4a2e] shrink-0 transition-transform ${openItem === item.id ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openItem === item.id && (
                      <div className="px-6 pb-5 border-t border-gray-50">
                        <p className="text-gray-600 leading-relaxed text-sm pt-4">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Still Have Questions ─────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-[#1a4a2e] rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Still have questions?</h2>
            <p className="text-green-200 mb-6">Contact us and we will get back to you within 24-48 hours.</p>
            <Link
              href="/contact"
              className="inline-block bg-white text-[#1a4a2e] hover:bg-[#f5f0e8] font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
