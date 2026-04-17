export default function AdBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative bg-gray-300 rounded-2xl overflow-hidden h-36 sm:h-44 w-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
        {/* Placeholder icon */}
        <div className="text-gray-400 flex flex-col items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium tracking-wide uppercase">Advertisement</span>
        </div>
      </div>
    </section>
  );
}
