"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Shared primitives ─────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function Field({
  label,
  id,
  optional,
  children,
}: {
  label: string;
  id?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={id}>
        {label}
        {optional && <span className="text-gray-400 font-normal"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
          checked ? "bg-[#1a4a2e] border-[#1a4a2e]" : "border-gray-300 group-hover:border-[#1a4a2e]/50"
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function RadioItem({
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked ? "border-[#1a4a2e]" : "border-gray-300"
        }`}
        onClick={onChange}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-[#1a4a2e]" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

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

// ── Progress indicator ────────────────────────────────────────────────────────
const STEPS = ["Farm Info", "Farming Practices", "Agreement"];

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  done
                    ? "bg-[#1a4a2e] border-[#1a4a2e] text-white"
                    : active
                    ? "bg-[#1a4a2e] border-[#1a4a2e] text-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${active ? "text-[#1a4a2e]" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-colors ${done ? "bg-[#1a4a2e]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Farm Information ──────────────────────────────────────────────────
const PRODUCT_TYPES = [
  "Fruits & Vegetables",
  "Meat & Poultry",
  "Dairy & Eggs",
  "Seafood",
  "Honey & Preserves",
  "Baked Goods",
  "Herbs & Botanicals",
  "Natural Skincare",
  "Candles & Home Products",
  "Natural Cleaning Products",
  "Other",
];
const FULFILLMENT_TYPES = ["Farm Pickup", "Local Delivery", "Shipping"];

function Step1({ onNext }: { onNext: () => void }) {
  const [products, setProducts] = useState<Record<string, boolean>>({});
  const [fulfillment, setFulfillment] = useState<Record<string, boolean>>({});
  const [otherText, setOtherText] = useState("");

  const toggleProduct = (p: string) =>
    setProducts((prev) => ({ ...prev, [p]: !prev[p] }));
  const toggleFulfillment = (f: string) =>
    setFulfillment((prev) => ({ ...prev, [f]: !prev[f] }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Farm Information</h2>

      <Field label="Farm / Business Name" id="farmName">
        <input id="farmName" type="text" placeholder="e.g. Green Valley Farm" className={inputCls} />
      </Field>
      <Field label="Your Full Name" id="fullName">
        <input id="fullName" type="text" placeholder="Jane Doe" className={inputCls} />
      </Field>
      <Field label="Email Address" id="email">
        <input id="email" type="email" placeholder="you@example.com" className={inputCls} />
      </Field>
      <Field label="Phone Number" id="phone">
        <input id="phone" type="tel" placeholder="+1 (555) 000-0000" className={inputCls} />
      </Field>
      <Field label="Farm Street Address" id="address">
        <input id="address" type="text" placeholder="123 Farm Road" className={inputCls} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="City" id="city">
          <input id="city" type="text" placeholder="Austin" className={inputCls} />
        </Field>
        <Field label="State" id="state">
          <div className="relative">
            <select id="state" defaultValue="" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none">
              <option value="" disabled>State</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </Field>
        <Field label="Zip Code" id="zip">
          <input id="zip" type="text" placeholder="78701" maxLength={10} className={inputCls} />
        </Field>
      </div>
      <Field label="Farm Website or Social Media" id="website" optional>
        <input id="website" type="url" placeholder="https://yourfarm.com" className={inputCls} />
      </Field>

      {/* Product types */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">What types of products do you sell?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {PRODUCT_TYPES.map((p) => (
            <CheckboxItem key={p} label={p} checked={!!products[p]} onChange={() => toggleProduct(p)} />
          ))}
        </div>
        {products["Other"] && (
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Please describe..."
            className={`${inputCls} mt-2`}
          />
        )}
      </div>

      {/* Fulfillment */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">How do you currently fulfill orders?</p>
        <div className="space-y-2.5">
          {FULFILLMENT_TYPES.map((f) => (
            <CheckboxItem key={f} label={f} checked={!!fulfillment[f]} onChange={() => toggleFulfillment(f)} />
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onNext}
          className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Farming Practices ─────────────────────────────────────────────────
type YesNo = "yes" | "no" | "";

function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [synthetic, setSynthetic] = useState<YesNo>("");
  const [gmo, setGmo] = useState<YesNo>("");
  const [monocrop, setMonocrop] = useState<YesNo>("");
  const [organic, setOrganic] = useState<YesNo>("");
  const [certName, setCertName] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Your Farming Practices</h2>

      <Field label="Describe your farming practices in detail:" id="practices">
        <textarea
          id="practices"
          rows={4}
          placeholder="Tell us about your soil care, crop rotation, water usage, pest management and overall approach to farming..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* Yes/No questions */}
      {([
        { q: "Do you use synthetic pesticides or herbicides?", state: synthetic, set: setSynthetic },
        { q: "Do you grow or sell any GMO products?",          state: gmo,       set: setGmo       },
        { q: "Do you practice monocrop agriculture?",          state: monocrop,  set: setMonocrop  },
      ] as const).map(({ q, state, set }) => (
        <div key={q}>
          <p className="text-sm font-medium text-gray-700 mb-2.5">{q}</p>
          <div className="flex gap-6">
            <RadioItem name={q} value="yes" checked={state === "yes"} onChange={() => set("yes")} label="Yes" />
            <RadioItem name={q} value="no"  checked={state === "no"}  onChange={() => set("no")}  label="No"  />
          </div>
        </div>
      ))}

      {/* Organic certification */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2.5">Are you certified organic?</p>
        <div className="flex gap-6 mb-3">
          <RadioItem name="organic" value="yes" checked={organic === "yes"} onChange={() => setOrganic("yes")} label="Yes" />
          <RadioItem name="organic" value="no"  checked={organic === "no"}  onChange={() => setOrganic("no")}  label="No"  />
        </div>
        {organic === "yes" && (
          <input
            type="text"
            placeholder="Which certification? (e.g. USDA Organic, Certified Naturally Grown)"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            className={inputCls}
          />
        )}
      </div>

      {/* Years farming */}
      <Field label="How long have you been farming?" id="years">
        <div className="relative">
          <select id="years" defaultValue="" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none">
            <option value="" disabled>Select...</option>
            {["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </Field>

      <Field label="Tell us what makes your farm unique:" id="unique">
        <textarea
          id="unique"
          rows={3}
          placeholder="Share your story, your values, and what sets your farm apart..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* File upload */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Upload photos of your farm <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#1a4a2e]/50 hover:bg-[#1a4a2e]/5 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</span>
          <input type="file" accept="image/*" multiple className="hidden" />
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Terms & Agreement ─────────────────────────────────────────────────
const TERMS_TEXT = `By applying to sell on Natures Alternative Market Place you agree to the following terms and conditions.

1. NATURAL FARMING STANDARDS
You certify that your farm and all products listed meet the natural farming standards of Natures Alternative Market Place. This includes but is not limited to: no synthetic pesticides or herbicides, no GMO products, no monocrop agriculture, and a commitment to regenerative or natural farming practices. Misrepresentation of your practices may result in immediate removal from the platform.

2. PLATFORM COMMISSION AND FEE STRUCTURE
Natures Alternative Market Place charges an 8% transaction fee on all sales completed through the platform. This fee is automatically deducted from each transaction. Fee structures are subject to change with 30 days written notice to sellers.

3. PRODUCT LISTING GUIDELINES
All product listings must be accurate, clearly described, and include truthful information about the product, its origin, and its production methods. Products must be natural and minimally processed. Natures Alternative reserves the right to remove any listing that does not meet platform standards.

4. ORDER FULFILLMENT RESPONSIBILITIES
Sellers are responsible for fulfilling orders in a timely manner and in accordance with the fulfillment method selected. You agree to communicate proactively with customers regarding order status. Failure to fulfill orders consistently may result in suspension or removal.

5. CODE OF CONDUCT
Sellers agree to communicate professionally and respectfully with customers and platform staff at all times. Harassment, fraud, or any form of misconduct will result in immediate removal from the platform.

6. PLATFORM RIGHTS
Natures Alternative Market Place reserves the right to remove, edit, or suspend any seller account or product listing that violates these terms, our community standards, or applicable law. We also reserve the right to use seller-provided photos and descriptions for marketing purposes with attribution.

7. DATA AND PRIVACY
By applying, you consent to Natures Alternative collecting and using the information you provide to operate, improve, and market the platform. We will not sell your personal data to third parties. Please review our full Privacy Policy for details.

8. CHANGES TO TERMS
These terms may be updated periodically. Continued use of the platform after notification of changes constitutes acceptance of the updated terms.`;

function Step3({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedStandards, setAgreedStandards] = useState(false);
  const [agreedReview, setAgreedReview] = useState(false);

  const allChecked = agreedTerms && agreedStandards && agreedReview;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Terms &amp; Agreement</h2>

      {/* Scrollable terms box */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Terms and Conditions</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 h-52 overflow-y-auto text-xs text-gray-500 leading-relaxed whitespace-pre-line bg-gray-50">
          {TERMS_TEXT}
        </div>
      </div>

      {/* Agreement checkboxes */}
      <div className="space-y-3 pt-1">
        <CheckboxItem
          label="I have read and agree to the Terms & Conditions"
          checked={agreedTerms}
          onChange={setAgreedTerms}
        />
        <CheckboxItem
          label="I confirm that my farming practices meet Natures Alternative standards"
          checked={agreedStandards}
          onChange={setAgreedStandards}
        />
        <CheckboxItem
          label="I understand that my application will be reviewed before approval"
          checked={agreedReview}
          onChange={setAgreedReview}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!allChecked}
          className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SellerApplicationForm() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleSubmit = () => {
    router.push("/seller/apply/submitted");
  };

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a4a2e] mb-2">Seller Application</h1>
        <p className="text-sm text-gray-500">Tell us about your farm. We review every application carefully.</p>
      </div>

      {/* Progress bar */}
      <ProgressBar current={step} />

      {/* Step content */}
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <Step3 onBack={() => setStep(2)} onSubmit={handleSubmit} />}
    </section>
  );
}
