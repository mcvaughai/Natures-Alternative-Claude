"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Constants ─────────────────────────────────────────────────────────────────
const SHIPPING = 8.0;
const TAX = 3.0;
const SUBTOTAL = 12.4;

const ORDER_ITEMS = [
  { id: 1, name: "Product", qty: 2, price: 12.4 },
  { id: 2, name: "Product", qty: 1, price: 6.5 },
  { id: 3, name: "Product", qty: 3, price: 18.75 },
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

// ── Shared sub-components ─────────────────────────────────────────────────────

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-900 mb-4">{children}</h2>;
}

function Field({ label, id, optional, children }: {
  label: string;
  id?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={id}>
        {label}{optional && <span className="text-gray-400 font-normal"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none"
    >
      {children}
    </select>
  );
}

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            checked ? "bg-[#1a4a2e] border-[#1a4a2e]" : "border-gray-300 group-hover:border-[#1a4a2e]/50"
          }`}
        >
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-gray-600 leading-snug">{children}</span>
    </label>
  );
}

function RadioOption({
  name,
  value,
  checked,
  onChange,
  label,
  description,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
        checked ? "border-[#1a4a2e] bg-[#1a4a2e]/5" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="relative mt-0.5 shrink-0">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
            checked ? "border-[#1a4a2e]" : "border-gray-300"
          }`}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-[#1a4a2e]" />}
        </div>
      </div>
      <div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

// ── Address Fields (reused for both shipping and billing) ─────────────────────
function AddressFields({ prefix = "" }: { prefix?: string }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" id={`${prefix}firstName`}>
          <Input id={`${prefix}firstName`} type="text" placeholder="Jane" />
        </Field>
        <Field label="Last Name" id={`${prefix}lastName`}>
          <Input id={`${prefix}lastName`} type="text" placeholder="Doe" />
        </Field>
      </div>
      <Field label="Street Address" id={`${prefix}address`}>
        <Input id={`${prefix}address`} type="text" placeholder="123 Maple Street" />
      </Field>
      <Field label="Apartment / Suite" id={`${prefix}apt`} optional>
        <Input id={`${prefix}apt`} type="text" placeholder="Apt 4B" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="City" id={`${prefix}city`}>
          <Input id={`${prefix}city`} type="text" placeholder="Austin" />
        </Field>
        <Field label="State" id={`${prefix}state`}>
          <div className="relative">
            <Select id={`${prefix}state`} defaultValue="">
              <option value="" disabled>State</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </Field>
        <Field label="Zip Code" id={`${prefix}zip`}>
          <Input id={`${prefix}zip`} type="text" placeholder="78701" maxLength={10} />
        </Field>
      </div>
      <Field label="Country" id={`${prefix}country`}>
        <div className="relative">
          <Select id={`${prefix}country`} defaultValue="US">
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
          </Select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </Field>
    </div>
  );
}

// ── Image placeholder ─────────────────────────────────────────────────────────
function ImgPlaceholder() {
  return (
    <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

// ── Left column ───────────────────────────────────────────────────────────────
function CheckoutForm() {
  const [emailOffers, setEmailOffers] = useState(false);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery" | "shipping">("delivery");
  const [savePayment, setSavePayment] = useState(false);
  const [billingOption, setBillingOption] = useState<"same" | "different">("same");

  return (
    <div className="space-y-5">
      {/* ── Contact Information ── */}
      <CardShell>
        <SectionTitle>Contact Information</SectionTitle>
        <div className="space-y-3">
          <Field label="Email Address" id="email">
            <Input id="email" type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Phone Number" id="phone">
            <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
          </Field>
          <Checkbox checked={emailOffers} onChange={setEmailOffers}>
            Email me with news and offers
          </Checkbox>
        </div>
      </CardShell>

      {/* ── Shipping Information ── */}
      <CardShell>
        <SectionTitle>Shipping Information</SectionTitle>
        <div className="space-y-4">
          <AddressFields prefix="ship-" />

          {/* Fulfillment method */}
          <div className="pt-1">
            <p className="text-sm font-medium text-gray-700 mb-3">Fulfillment Method</p>
            <div className="space-y-2">
              <RadioOption
                name="fulfillment"
                value="pickup"
                checked={fulfillment === "pickup"}
                onChange={() => setFulfillment("pickup")}
                label="Pickup"
                description="I will pick up from the farm"
              />
              <RadioOption
                name="fulfillment"
                value="delivery"
                checked={fulfillment === "delivery"}
                onChange={() => setFulfillment("delivery")}
                label="Local Delivery"
                description="Deliver to my address"
              />
              <RadioOption
                name="fulfillment"
                value="shipping"
                checked={fulfillment === "shipping"}
                onChange={() => setFulfillment("shipping")}
                label="Shipping"
                description="Ship to my address"
              />
            </div>
          </div>
        </div>
      </CardShell>

      {/* ── Payment Information ── */}
      <CardShell>
        <SectionTitle>Payment Information</SectionTitle>
        <div className="space-y-3">
          <Field label="Card Number" id="cardNumber">
            <div className="relative">
              <Input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" maxLength={19} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiration Date" id="expiry">
              <Input id="expiry" type="text" placeholder="MM / YY" maxLength={7} />
            </Field>
            <Field label="CVV" id="cvv">
              <Input id="cvv" type="text" placeholder="•••" maxLength={4} />
            </Field>
          </div>

          <Field label="Name on Card" id="cardName">
            <Input id="cardName" type="text" placeholder="Jane Doe" />
          </Field>

          {/* Accepted payment icons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-400 mr-1">Accepted:</span>
            {["VISA", "MC", "AMEX"].map((brand) => (
              <span
                key={brand}
                className="px-2.5 py-1 border border-gray-200 rounded-md text-[11px] font-bold text-gray-500 bg-gray-50 tracking-wide"
              >
                {brand}
              </span>
            ))}
          </div>

          <Checkbox checked={savePayment} onChange={setSavePayment}>
            Save payment info for future purchases
          </Checkbox>
        </div>
      </CardShell>

      {/* ── Billing Address ── */}
      <CardShell>
        <SectionTitle>Billing Address</SectionTitle>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <RadioOption
              name="billing"
              value="same"
              checked={billingOption === "same"}
              onChange={() => setBillingOption("same")}
              label="Same as shipping address"
            />
            <RadioOption
              name="billing"
              value="different"
              checked={billingOption === "different"}
              onChange={() => setBillingOption("different")}
              label="Use a different billing address"
            />
          </div>
          {billingOption === "different" && (
            <div className="pt-2">
              <AddressFields prefix="bill-" />
            </div>
          )}
        </div>
      </CardShell>

      {/* ── Back to Cart ── */}
      <div className="pt-1">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-[#1a4a2e] font-semibold hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cart
        </Link>
      </div>
    </div>
  );
}

// ── Right column — Order Summary ──────────────────────────────────────────────
function OrderSummary() {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const router = useRouter();

  const total = SUBTOTAL + SHIPPING + TAX;

  return (
    <div className="lg:sticky lg:top-[120px]">
      <CardShell>
        <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

        {/* Order items */}
        <div className="space-y-4 mb-5">
          {ORDER_ITEMS.map((item, idx) => (
            <div key={item.id}>
              <div className="flex items-center gap-3">
                <ImgPlaceholder />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
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

        <hr className="border-gray-100 mb-4" />

        {/* Promo code */}
        <button
          onClick={() => setPromoOpen(!promoOpen)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3"
        >
          <span>Add promo code</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {promoOpen && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
            />
            <button className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Apply
            </button>
          </div>
        )}

        <hr className="border-gray-100 mb-4" />

        {/* Line items */}
        <div className="space-y-2.5 text-sm mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums">${SUBTOTAL.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping &amp; handling</span>
            <span className="font-medium tabular-nums">${SHIPPING.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated tax</span>
            <span className="font-medium tabular-nums">${TAX.toFixed(2)}</span>
          </div>
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Total */}
        <div className="flex justify-between font-bold text-gray-900 text-base mb-5">
          <span>Total</span>
          <span className="tabular-nums">${total.toFixed(2)}</span>
        </div>

        {/* Place Order */}
        <button
          onClick={() => router.push("/order-confirmation")}
          className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white py-3.5 rounded-xl font-semibold text-sm transition-colors"
        >
          Place Order
        </button>

        {/* Secure checkout */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-gray-400">Secure checkout</span>
        </div>

        {/* Terms */}
        <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
          By placing your order you agree to our{" "}
          <Link href="/terms" className="text-[#1a4a2e] hover:underline font-medium">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#1a4a2e] hover:underline font-medium">
            Privacy Policy
          </Link>
        </p>
      </CardShell>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CheckoutSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-7">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left — form */}
        <CheckoutForm />

        {/* Right — summary */}
        <OrderSummary />
      </div>
    </section>
  );
}
