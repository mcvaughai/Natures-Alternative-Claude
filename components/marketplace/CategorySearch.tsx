import Link from "next/link";

const CATEGORIES = [
  { label: "Fruits & Vegetables", href: "/explore?category=fruits-vegetables" },
  { label: "Meat & Seafood",      href: "/explore?category=meat-seafood" },
  { label: "Dairy & Eggs",        href: "/explore?category=dairy-eggs" },
];

export default function CategorySearch() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Category Search</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => (
          <Link key={cat.href} href={cat.href} className="cursor-pointer group">
            <div className="bg-gray-200 rounded-2xl h-44 flex items-center justify-center text-gray-400 group-hover:bg-gray-300 group-hover:scale-[1.02] group-hover:shadow-md transition-all duration-200 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-center font-semibold text-gray-700 mt-3 group-hover:text-[#1a4a2e] transition-colors">
              {cat.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
