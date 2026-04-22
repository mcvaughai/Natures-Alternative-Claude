import Link from "next/link";

const FULFILLMENT_STYLES: Record<string, { icon: string; cls: string }> = {
  Pickup:   { icon: "🚗", cls: "bg-green-100 text-green-700"  },
  Delivery: { icon: "🚚", cls: "bg-blue-100 text-blue-700"    },
  Ships:    { icon: "📦", cls: "bg-purple-100 text-purple-700" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 ${i <= Math.floor(rating) ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-200 stroke-gray-200"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export interface FarmCardData {
  id: string;
  name: string;
  location: string;
  description: string;
  categories: string[];
  fulfillment: string[];
  rating: number;
  reviewCount: number;
  productCount: number;
  featured?: boolean;
}

export default function FarmCard({
  id, name, location, description, categories, fulfillment,
  rating, reviewCount, productCount, featured,
}: FarmCardData) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md hover:-translate-y-0.5 group ${featured ? "border-[#1a4a2e]" : "border-gray-100"}`}>
      {/* Banner */}
      <div className="relative bg-gray-200 h-44 flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {featured && (
          <span className="absolute top-3 right-3 bg-[#1a4a2e] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2.5">
        {/* Name + location */}
        <div>
          <h3 className="text-base font-bold text-[#1a4a2e] group-hover:text-[#2d6b47] transition-colors leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-500">{location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>

        {/* Category tags */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <span key={cat} className="text-xs px-2 py-0.5 rounded-full border border-[#1a4a2e]/25 text-[#1a4a2e] font-medium bg-[#1a4a2e]/5">
              {cat}
            </span>
          ))}
        </div>

        {/* Fulfillment badges */}
        <div className="flex flex-wrap gap-1">
          {fulfillment.map((f) => {
            const s = FULFILLMENT_STYLES[f] ?? { icon: "", cls: "bg-gray-100 text-gray-600" };
            return (
              <span key={f} className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                {s.icon} {f}
              </span>
            );
          })}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Stars rating={rating} />
          <span className="text-sm font-semibold text-gray-800">{rating}</span>
          <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-500">{productCount} products available</span>
          <Link
            href={`/store/${id}`}
            className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Visit Store
          </Link>
        </div>
      </div>
    </div>
  );
}
