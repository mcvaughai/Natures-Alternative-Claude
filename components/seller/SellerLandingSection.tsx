import Link from "next/link";
import StoreCard from "@/components/shared/StoreCard";

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="bg-[#1a4a2e] relative overflow-hidden">
      {/* Botanical left decoration */}
      <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-40 pointer-events-none select-none opacity-10">
        <svg viewBox="0 0 120 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path d="M60 500 Q65 440 55 390 Q65 330 55 270 Q65 210 55 150 Q65 90 58 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M60 450 Q22 430 8 400 Q32 415 60 440Z" fill="white" />
          <path d="M60 450 Q95 432 108 402 Q84 417 60 440Z" fill="white" />
          <path d="M57 370 Q18 350 5 318 Q30 334 57 362Z" fill="white" />
          <path d="M57 370 Q96 352 108 320 Q84 337 57 362Z" fill="white" />
          <path d="M60 285 Q16 264 4 230 Q30 248 60 278Z" fill="white" />
          <path d="M60 285 Q100 266 112 232 Q87 250 60 278Z" fill="white" />
          <path d="M56 200 Q14 179 4 144 Q30 163 56 192Z" fill="white" />
          <path d="M56 200 Q98 181 108 146 Q83 165 56 192Z" fill="white" />
          <path d="M58 115 Q18 95 10 60 Q34 80 58 108Z" fill="white" />
          <path d="M58 115 Q96 97 104 62 Q80 82 58 108Z" fill="white" />
        </svg>
      </div>
      {/* Botanical right decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-28 sm:w-40 pointer-events-none select-none opacity-10 scale-x-[-1]">
        <svg viewBox="0 0 120 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path d="M60 500 Q65 440 55 390 Q65 330 55 270 Q65 210 55 150 Q65 90 58 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M60 450 Q22 430 8 400 Q32 415 60 440Z" fill="white" />
          <path d="M60 450 Q95 432 108 402 Q84 417 60 440Z" fill="white" />
          <path d="M57 370 Q18 350 5 318 Q30 334 57 362Z" fill="white" />
          <path d="M57 370 Q96 352 108 320 Q84 337 57 362Z" fill="white" />
          <path d="M60 285 Q16 264 4 230 Q30 248 60 278Z" fill="white" />
          <path d="M60 285 Q100 266 112 232 Q87 250 60 278Z" fill="white" />
          <path d="M56 200 Q14 179 4 144 Q30 163 56 192Z" fill="white" />
          <path d="M56 200 Q98 181 108 146 Q83 165 56 192Z" fill="white" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-5">
          Sell Your Farm Products<br className="hidden sm:block" /> Directly to Consumers
        </h1>
        <p className="text-green-100 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Join a marketplace built specifically for small natural farms and producers. Reach local customers who care about where their food comes from.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/seller/apply"
            className="inline-block bg-[#f5f0e8] hover:bg-white text-[#1a4a2e] font-bold px-8 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            Apply to Sell
          </Link>
          <a
            href="#how-it-works"
            className="inline-block border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
          >
            Learn More
          </a>
        </div>
        <p className="mt-6 text-sm text-green-200">
          Already a seller?{" "}
          <Link href="/seller/login" className="text-white font-semibold underline underline-offset-2 hover:text-green-100 transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    step: "1",
    title: "Apply to Join",
    desc: "Fill out our simple application and tell us about your farm and practices.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    step: "2",
    title: "Get Approved",
    desc: "We review your application to ensure you meet our natural farming standards.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    step: "3",
    title: "Set Up Your Store",
    desc: "Customize your storefront, add your products and set your fulfillment options.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    step: "4",
    title: "Start Selling",
    desc: "Start reaching local customers who want fresh natural farm products.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a4a2e] text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map((step) => (
            <div key={step.step} className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center text-[#1a4a2e]">
                  {step.icon}
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#1a4a2e] text-white text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Sell With Us ──────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Direct to Consumer",
    desc: "Sell directly to customers with no middleman. Keep more of your profits.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Your Own Storefront",
    desc: "Get a fully customizable store page that represents your farm's brand and story.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: "Flexible Fulfillment",
    desc: "Offer pickup, local delivery, or shipping — whatever works for your farm.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Reach Local Customers",
    desc: "Connect with customers in your area who are actively looking for natural products.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Simple Dashboard",
    desc: "Manage your products, orders and store all from one easy to use dashboard.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Community of Farms",
    desc: "Join a growing community of like-minded natural farms and producers.",
  },
];

function WhyUs() {
  return (
    <section className="py-16 px-4 bg-white/40">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-10">Why Sell With Us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-11 h-11 rounded-xl bg-[#1a4a2e]/10 flex items-center justify-center text-[#1a4a2e] mb-4">
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Requirements ──────────────────────────────────────────────────────────────
const STANDARDS = [
  "No monocrop agriculture practices",
  "No synthetic pesticides or herbicides",
  "No GMO products",
  "Commitment to regenerative or natural farming practices",
  "Transparent about your farming methods",
  "Products must be natural and minimally processed",
];

function Requirements() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">Our Standards</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            We are committed to supporting farms that respect the natural order. To sell on Natures Alternative you must meet the following standards:
          </p>
          <ul className="space-y-3">
            {STANDARDS.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1a4a2e] flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-6 leading-relaxed border-t border-gray-100 pt-4">
            We review each application carefully. Not meeting these standards will result in rejection.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const STARTER_FEATURES = [
  "Your own storefront",
  "Up to 20 product listings",
  "Basic analytics",
  "Customer messaging",
  "8% transaction fee",
];
const PRO_FEATURES = [
  "Everything in Starter",
  "Unlimited product listings",
  "Advanced analytics",
  "Priority placement",
  "Reduced transaction fee",
  "Dedicated support",
];

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-gray-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1a4a2e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      {text}
    </li>
  );
}

function Pricing() {
  return (
    <section className="py-16 px-4 bg-white/40">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">Simple Pricing</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Free to start. We grow together.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Starter */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#1a4a2e] p-7 flex flex-col">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Starter</p>
              <p className="text-4xl font-bold text-[#1a4a2e]">Free</p>
              <p className="text-xs text-gray-500 mt-1">Perfect for getting started</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {STARTER_FEATURES.map((f) => <CheckItem key={f} text={f} />)}
            </ul>
            <Link
              href="/seller/apply"
              className="block w-full text-center bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Apply Now
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7 flex flex-col opacity-80">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pro</p>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wide">Coming Soon</span>
              </div>
              <p className="text-4xl font-bold text-gray-400">—</p>
              <p className="text-xs text-gray-400 mt-1">For established farms ready to scale</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full border-2 border-gray-200 text-gray-400 font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Featured Farms ────────────────────────────────────────────────────────────
const FEATURED_FARMS = [
  { id: 1, name: "Purple Food Crew",  tagline: "Specializing in rare and exotic natural produce from our family farm." },
  { id: 2, name: "Force of Nature",   tagline: "Regenerative cattle and poultry raised on open pastures." },
  { id: 3, name: "Example Farms",     tagline: "Fresh seasonal vegetables grown without synthetic pesticides." },
  { id: 4, name: "W&W Farms",         tagline: "Heritage grain and heirloom crops grown the traditional way." },
];

function FeaturedFarms() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">Farms Already Selling With Us</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {FEATURED_FARMS.map((farm) => (
            <StoreCard key={farm.id} id={farm.id} name={farm.name} tagline={farm.tagline} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="bg-[#1a4a2e] py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to Start Selling?</h2>
        <p className="text-green-100 text-sm mb-8">Join our growing community of natural farms today.</p>
        <Link
          href="/seller/apply"
          className="inline-block bg-[#f5f0e8] hover:bg-white text-[#1a4a2e] font-bold px-10 py-3 rounded-xl transition-colors text-sm shadow-sm"
        >
          Apply to Sell
        </Link>
      </div>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SellerLandingSection() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhyUs />
      <Requirements />
      <Pricing />
      <FeaturedFarms />
      <CTA />
    </>
  );
}
