import Link from "next/link";

interface StoreHeroProps {
  storeId: string;
}

export default function StoreHero({ storeId }: StoreHeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative bg-gray-300 rounded-2xl overflow-hidden h-64 sm:h-80 lg:h-96 w-full">

        {/* Placeholder image icon */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.6} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Overlay text card — bottom left */}
        <div className="absolute bottom-0 left-0 m-5 sm:m-7 max-w-xs">
          <div className="bg-black/65 backdrop-blur-sm rounded-xl p-5">
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua, ut enim veniam quis nostrud.
            </p>
            <Link
              href={`/store/${storeId}/shop`}
              className="inline-block bg-gray-900 hover:bg-gray-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
