"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface StoreCardProps {
  id?: string | number;
  name: string;
  tagline?: string;
  showBookmark?: boolean;
}

export default function StoreCard({
  id,
  name,
  tagline = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  showBookmark = false,
}: StoreCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const router = useRouter();

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group ${id ? "cursor-pointer" : ""}`}
      onClick={() => id && router.push(`/store/${id}`)}
    >
      {/* Image placeholder */}
      <div className="relative bg-gray-200 h-36 flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        {/* Bookmark button */}
        {showBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm z-10"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark store"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transition-colors ${bookmarked ? "fill-[#1a4a2e] stroke-[#1a4a2e]" : "fill-none stroke-gray-500"}`}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-[#1a4a2e] transition-colors">{name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{tagline}</p>
      </div>
    </div>
  );
}
