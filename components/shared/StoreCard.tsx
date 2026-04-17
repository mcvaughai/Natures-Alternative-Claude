interface StoreCardProps {
  name: string;
  tagline?: string;
}

export default function StoreCard({
  name,
  tagline = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
}: StoreCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Image placeholder */}
      <div className="bg-gray-200 h-36 flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-[#1a4a2e] transition-colors">{name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{tagline}</p>
      </div>
    </div>
  );
}
