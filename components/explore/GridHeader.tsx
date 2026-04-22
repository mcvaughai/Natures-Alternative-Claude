"use client";
import { useState } from "react";

const SORT_OPTIONS = [
  "Relevance",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
  "Top Rated",
  "Most Popular",
  "Distance: Nearest First",
];

interface GridHeaderProps {
  resultCount?: number;
}

export default function GridHeader({ resultCount = 24 }: GridHeaderProps) {
  const [sort, setSort] = useState("Relevance");

  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{resultCount}</span> results
      </p>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500 whitespace-nowrap hidden sm:block">Sort by:</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/20 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
