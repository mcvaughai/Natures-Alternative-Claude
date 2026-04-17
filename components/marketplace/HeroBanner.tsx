const BANNERS = [
  { label: "Fresh Produce Delivered Daily", sub: "Straight from the farm to your door" },
  { label: "Seasonal Specials", sub: "Limited harvest — shop before it's gone" },
  { label: "Farm-Fresh Meat & Dairy", sub: "Pasture-raised, antibiotic-free" },
];

export default function HeroBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BANNERS.map((banner, i) => (
          <div
            key={i}
            className="relative bg-gray-300 rounded-2xl overflow-hidden h-52 sm:h-60 flex items-end cursor-pointer hover:opacity-90 transition-opacity"
          >
            {/* Placeholder image icon */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Text overlay */}
            <div className="relative z-10 w-full p-5 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white font-bold text-base sm:text-lg leading-tight">{banner.label}</p>
              <p className="text-white/80 text-xs mt-0.5">{banner.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
