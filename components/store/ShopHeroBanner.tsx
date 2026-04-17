export default function ShopHeroBanner() {
  return (
    <div className="relative w-full h-48 sm:h-56 bg-[#1a4a2e] overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <p className="text-green-300 text-sm font-medium tracking-wide mb-1">Welcome to our store</p>
        <h1 className="text-white text-3xl sm:text-4xl font-bold mb-2">Shop All Products</h1>
        <p className="text-green-100/80 text-sm max-w-md">
          Fresh, locally sourced produce delivered straight from our farm to your table.
        </p>
      </div>

      {/* Decorative arc */}
      <svg
        className="absolute bottom-0 right-0 text-[#f5f0e8] opacity-10"
        width="320"
        height="180"
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="320" cy="180" r="200" stroke="currentColor" strokeWidth="40" />
        <circle cx="320" cy="180" r="120" stroke="currentColor" strokeWidth="30" />
      </svg>
    </div>
  );
}
