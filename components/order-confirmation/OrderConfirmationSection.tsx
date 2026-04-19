"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

// ── Static placeholder data ───────────────────────────────────────────────────
const ORDER_ITEMS = [
  { id: 1, name: "Product", farm: "Example Farms", qty: 2, price: 12.4 },
  { id: 2, name: "Product", farm: "Example Farms", qty: 1, price: 6.5 },
  { id: 3, name: "Product", farm: "Green Valley Farm", qty: 3, price: 18.75 },
];

const SUBTOTAL = 37.65;
const SHIPPING = 8.0;
const TAX = 3.0;
const TOTAL = SUBTOTAL + SHIPPING + TAX;

const NEXT_STEPS = [
  {
    title: "Your order has been sent to the farm",
    desc: "We've notified Example Farms of your order and payment.",
  },
  {
    title: "The farm will confirm your order within 24 hours",
    desc: "Farms review each order to ensure availability of fresh stock.",
  },
  {
    title: "You will receive an email with fulfillment details",
    desc: "Check your inbox for pickup or delivery instructions.",
  },
  {
    title: "Pickup or receive your fresh farm products!",
    desc: "Enjoy the freshest produce straight from the source.",
  },
];

const SUGGESTED_PRODUCTS = [
  { id: 10, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$4.99" },
  { id: 11, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$7.50" },
  { id: 12, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$3.25" },
  { id: 13, name: "Product", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", price: "$9.99" },
];

// ── Shared primitives ─────────────────────────────────────────────────────────
function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, green = false }: { children: React.ReactNode; green?: boolean }) {
  return (
    <h2 className={`text-base font-bold mb-4 ${green ? "text-[#1a4a2e]" : "text-gray-900"}`}>
      {children}
    </h2>
  );
}

function Divider() {
  return <hr className="border-gray-100 my-4" />;
}

function ImgPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 flex items-center justify-center text-gray-400 shrink-0 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function ConfirmationHero() {
  return (
    <div className="text-center py-10 px-4">
      {/* Checkmark circle */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1a4a2e] mb-5 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-[#1a4a2e] mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-3">Thank you for supporting local farms!</p>

      <p className="text-base font-bold text-gray-800 mb-1">Order #NA-2024-001</p>
      <p className="text-xs text-gray-400">A confirmation email has been sent to your email address.</p>
    </div>
  );
}

// ── Order Details card ────────────────────────────────────────────────────────
function OrderDetailsCard() {
  return (
    <CardShell>
      <CardTitle>Order Details</CardTitle>

      <div className="space-y-4">
        {ORDER_ITEMS.map((item, idx) => (
          <div key={item.id}>
            <div className="flex items-center gap-3">
              <ImgPlaceholder className="w-14 h-14 rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                <p className="text-xs text-[#1a4a2e] font-medium mt-0.5">From: {item.farm}</p>
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.qty}</p>
              </div>
              <span className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">
                ${item.price.toFixed(2)}
              </span>
            </div>
            {idx < ORDER_ITEMS.length - 1 && <hr className="border-gray-100 mt-4" />}
          </div>
        ))}
      </div>

      <Divider />

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="tabular-nums">${SUBTOTAL.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping &amp; handling</span>
          <span className="tabular-nums">${SHIPPING.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span className="tabular-nums">${TAX.toFixed(2)}</span>
        </div>
      </div>

      <Divider />

      <div className="flex justify-between font-bold text-gray-900 text-base">
        <span>Total</span>
        <span className="tabular-nums">${TOTAL.toFixed(2)}</span>
      </div>
    </CardShell>
  );
}

// ── Fulfillment Information card ──────────────────────────────────────────────
function FulfillmentCard() {
  return (
    <CardShell>
      <CardTitle>Fulfillment Information</CardTitle>

      {/* Method */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-[#1a4a2e]/5 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1a4a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Pickup at Farm</p>
          <p className="text-xs text-gray-500">You selected in-person pickup</p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Farm</p>
          <p className="font-semibold text-gray-800">Example Farms</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Address</p>
          <p className="text-gray-700">123 Farm Road, Houston TX 77001</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Estimated Ready</p>
          <p className="font-semibold text-[#1a4a2e]">Ready by: December 15, 2024</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          The farm will contact you to confirm your pickup/delivery details.
        </p>
      </div>
    </CardShell>
  );
}

// ── Your Information card ─────────────────────────────────────────────────────
function YourInfoCard() {
  const rows = [
    { label: "Name", value: "John Doe" },
    { label: "Email", value: "john@email.com" },
    { label: "Phone", value: "(555) 123-4567" },
    { label: "Address", value: "123 Main St, Houston TX 77001" },
  ];
  return (
    <CardShell>
      <CardTitle>Your Information</CardTitle>
      <div className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium w-16 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-gray-700">{value}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ── What Happens Next card ────────────────────────────────────────────────────
function NextStepsCard() {
  return (
    <CardShell>
      <CardTitle green>What Happens Next?</CardTitle>
      <ol className="space-y-5">
        {NEXT_STEPS.map((step, i) => (
          <li key={i} className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-[#1a4a2e] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{step.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </CardShell>
  );
}

// ── Action Buttons card ───────────────────────────────────────────────────────
function ActionButtonsCard() {
  const router = useRouter();
  return (
    <CardShell>
      <div className="space-y-3">
        <button
          onClick={() => router.push("/account/orders")}
          className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Track Your Order
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full border border-[#1a4a2e] text-[#1a4a2e] font-semibold py-2.5 rounded-xl hover:bg-[#1a4a2e]/5 transition-colors text-sm bg-white"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => router.push("/account")}
          className="w-full border border-[#1a4a2e] text-[#1a4a2e] font-semibold py-2.5 rounded-xl hover:bg-[#1a4a2e]/5 transition-colors text-sm bg-white"
        >
          View Your Account
        </button>
      </div>
    </CardShell>
  );
}

// ── Farm Spotlight ────────────────────────────────────────────────────────────
function FarmSpotlight() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader title="You Ordered From" />

      <div className="max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Farm image placeholder */}
          <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-gray-800 mb-1.5">Example Farms</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <Link
              href="/store/1"
              className="inline-flex items-center gap-1.5 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Visit Store
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── You Might Also Like ───────────────────────────────────────────────────────
function SuggestedProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <SectionHeader title="You Might Also Like" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {SUGGESTED_PRODUCTS.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function OrderConfirmationSection() {
  return (
    <>
      {/* Hero */}
      <ConfirmationHero />

      {/* Two-column body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Left column */}
          <div className="space-y-5">
            <OrderDetailsCard />
            <FulfillmentCard />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <YourInfoCard />
            <NextStepsCard />
            <ActionButtonsCard />
          </div>

        </div>
      </section>

      {/* Farm spotlight */}
      <FarmSpotlight />

      {/* Suggested products */}
      <SuggestedProducts />
    </>
  );
}
