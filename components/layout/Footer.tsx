import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1a4a2e] text-white relative overflow-hidden mt-10">

      {/* ── Botanical decoration — left side ──────────────────── */}
      <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-44 pointer-events-none select-none opacity-15">
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
          <circle cx="58" cy="22" r="5" fill="white" />
          <circle cx="60" cy="14" r="3.5" fill="white" />
        </svg>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-14 text-center">

        {/* Logo */}
        <div className="flex items-center justify-center mb-1">
          <Image
            src="/main_logo.png"
            alt="Natures Alternative Market Place"
            width={220}
            height={70}
            className="object-contain"
          />
        </div>
        <p className="text-green-300 text-sm mb-8">Farm-fresh produce, delivered with care.</p>

        {/* Join the Revolution */}
        <h3 className="text-2xl font-bold mb-2">Join the Revolution!</h3>
        <p className="text-green-100 text-sm mb-5 max-w-sm mx-auto">
          Sign up for our newsletter and be the first to hear about fresh arrivals, seasonal deals, and local farm stories.
        </p>

        <div className="flex items-stretch justify-center max-w-sm mx-auto mb-8 rounded-full overflow-hidden ring-1 ring-white/20">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-5 py-2.5 text-gray-800 text-sm focus:outline-none min-w-0"
          />
          <button className="bg-[#8b1a1a] hover:bg-[#6d1414] transition-colors text-white px-6 py-2.5 text-sm font-semibold shrink-0">
            Submit
          </button>
        </div>

        {/* Social icons — Instagram, Facebook, Twitter */}
        <div className="flex justify-center gap-3 mb-8">
          {/* Instagram */}
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* Twitter / X */}
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* Divider */}
        <hr className="border-white/10 mb-6" />

        {/* Footer links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-green-300">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="text-green-700 text-xs">|</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms of use</a>
          <span className="text-green-700 text-xs">|</span>
          <a href="/about" className="hover:text-white transition-colors">About Us</a>
          <span className="text-green-700 text-xs">|</span>
          <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
          <span className="text-green-700 text-xs">|</span>
          <a href="/faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <p className="text-green-600 text-xs mt-4">© {new Date().getFullYear()} Natures Alternative Market Place. All rights reserved.</p>
        <a href="/admin/login" className="text-green-800 text-xs mt-2 inline-block hover:text-green-600 transition-colors">Admin</a>
      </div>
    </footer>
  );
}
