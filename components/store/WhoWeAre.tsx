export default function WhoWeAre() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-12 uppercase tracking-wider">
        Who We Are and What We Do
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: large image placeholder */}
        <div className="bg-gray-200 aspect-square rounded-2xl flex items-center justify-center text-gray-400 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Right: text */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum et dolore.
          </p>
          <button className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
