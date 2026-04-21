import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import StoreCard from "@/components/shared/StoreCard";

const VALUES = [
  {
    icon: "🌱",
    title: "Natural Farming",
    desc: "We only work with farms that respect the land and avoid synthetic chemicals, GMOs and monocrop practices.",
  },
  {
    icon: "🤝",
    title: "Direct Connection",
    desc: "We connect consumers directly with the farms that grow their food. No middlemen, no mystery.",
  },
  {
    icon: "🌍",
    title: "Regenerative Future",
    desc: "We believe in farming practices that heal the earth rather than deplete it.",
  },
  {
    icon: "💚",
    title: "Community First",
    desc: "We are building a community of farmers and consumers who share a vision for a healthier more natural world.",
  },
];

const TEAM = [
  {
    name: "James McVaugh",
    role: "Founder & CEO",
    bio: "Passionate about reconnecting people with the source of their food and building tools for regenerative farmers.",
  },
  {
    name: "Team Member",
    role: "Operations Lead",
    bio: "Building systems that make farm-to-consumer commerce seamless and accessible for farms of all sizes.",
  },
  {
    name: "Team Member",
    role: "Farmer Relations",
    bio: "Working directly with farms every day to maintain our natural farming standards and support their growth.",
  },
];

const FARMS = [
  { id: "1", name: "Example Farms", tagline: "Pasture raised meats and seasonal vegetables from the Texas Hill Country." },
  { id: "2", name: "Purple Food Crew", tagline: "Specialty produce and rare heirloom varieties grown without chemicals." },
  { id: "3", name: "Force of Nature", tagline: "Regenerative ranch beef and heritage pork raised on open pasture." },
  { id: "4", name: "W&W Farms", tagline: "Family owned dairy and free range eggs delivered fresh weekly." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-[#1a4a2e] relative overflow-hidden py-20 text-center">
          <div className="absolute left-0 top-0 bottom-0 w-40 opacity-10 pointer-events-none select-none">
            <svg viewBox="0 0 120 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
              <path d="M60 500 Q65 440 55 390 Q65 330 55 270 Q65 210 55 150 Q65 90 58 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M60 450 Q22 430 8 400 Q32 415 60 440Z" fill="white" />
              <path d="M60 450 Q95 432 108 402 Q84 417 60 440Z" fill="white" />
              <path d="M57 370 Q18 350 5 318 Q30 334 57 362Z" fill="white" />
              <path d="M57 370 Q96 352 108 320 Q84 337 57 362Z" fill="white" />
              <path d="M60 285 Q16 264 4 230 Q30 248 60 278Z" fill="white" />
              <path d="M60 285 Q100 266 112 232 Q87 250 60 278Z" fill="white" />
            </svg>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10 pointer-events-none select-none" style={{ transform: "scaleX(-1)" }}>
            <svg viewBox="0 0 120 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
              <path d="M60 500 Q65 440 55 390 Q65 330 55 270 Q65 210 55 150 Q65 90 58 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M60 450 Q22 430 8 400 Q32 415 60 440Z" fill="white" />
              <path d="M60 450 Q95 432 108 402 Q84 417 60 440Z" fill="white" />
              <path d="M57 370 Q18 350 5 318 Q30 334 57 362Z" fill="white" />
              <path d="M57 370 Q96 352 108 320 Q84 337 57 362Z" fill="white" />
              <path d="M60 285 Q16 264 4 230 Q30 248 60 278Z" fill="white" />
              <path d="M60 285 Q100 266 112 232 Q87 250 60 278Z" fill="white" />
            </svg>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">About Natures Alternative</h1>
            <p className="text-[#f5f0e8] text-lg opacity-90">Reconnecting people with the natural order of food</p>
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center text-gray-400 order-2 lg:order-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-[#1a4a2e] mb-6">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Natures Alternative was born from a simple belief — that people deserve to know where their food comes from and that small natural farms deserve a direct path to the consumers who care. We are building a marketplace that puts farmers and consumers in direct connection, cutting out the middleman and restoring the natural relationship between land and table.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We started as a platform for small regenerative and natural farms to sell directly to local consumers. Our vision is to grow into the worlds leading marketplace for natural products — in a world that has increasingly separated itself from the natural order of things.
              </p>
            </div>
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">What We Stand For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Story ────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Our Story</h2>
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
            <p className="text-gray-700 leading-relaxed mb-4">
              Natures Alternative started with a simple frustration — the disconnect between people and their food. We watched as grocery chains replaced local farms, as labels replaced transparency, and as chemicals replaced care. We decided to build something different.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              In our first year, we partnered with a handful of farms in Texas — farms run by people who knew every animal by name and every row of crops by hand. We built them storefronts, connected them with their communities, and watched transactions turn into relationships.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              What makes Natures Alternative different is not just the technology — it is the standards. Every farm on our platform is vetted. No GMOs, no synthetic pesticides, no factory farming. What you see is what you get, direct from the people who grew it.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We are building toward a future where every community has direct access to natural food, where small farms thrive, and where the relationship between land and table is restored. We are just getting started.
            </p>
          </div>
        </section>

        {/* ── Team ─────────────────────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">The Team Behind Natures Alternative</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {TEAM.map((member, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-[#1a4a2e] font-medium mb-2">{member.role}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Farms ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Meet Our Farmers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FARMS.map((farm) => (
              <StoreCard key={farm.id} id={farm.id} name={farm.name} tagline={farm.tagline} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/explore"
              className="inline-block bg-[#1a4a2e] hover:bg-[#143d24] text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              View All Farms
            </Link>
          </div>
        </section>

        {/* ── Join Section ─────────────────────────────────────────── */}
        <section className="bg-[#1a4a2e] py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Join the Revolution</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-white text-[#1a4a2e] hover:bg-[#f5f0e8] font-semibold px-8 py-3 rounded-full transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/seller"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1a4a2e] font-semibold px-8 py-3 rounded-full transition-colors"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
