"use client";
import { useState } from "react";

const GROUP_ONE = Array.from({ length: 6 });
const GROUP_TWO = Array.from({ length: 5 });

export default function FiltersPanel() {
  const [checkedA, setCheckedA] = useState<boolean[]>(Array(GROUP_ONE.length).fill(false));
  const [checkedB, setCheckedB] = useState<boolean[]>(Array(GROUP_TWO.length).fill(false));

  function toggleA(i: number) {
    const next = [...checkedA];
    next[i] = !next[i];
    setCheckedA(next);
    console.log("Filter group A, index", i, "→", next[i]);
  }

  function toggleB(i: number) {
    const next = [...checkedB];
    next[i] = !next[i];
    setCheckedB(next);
    console.log("Filter group B, index", i, "→", next[i]);
  }

  return (
    <aside className="w-full">
      {/* Group A */}
      <p className="font-bold text-gray-800 text-sm mb-3">Filters</p>
      <div className="space-y-2.5 mb-7">
        {GROUP_ONE.map((_, i) => (
          <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
            <span
              onClick={() => toggleA(i)}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checkedA[i]
                  ? "bg-[#1a4a2e] border-[#1a4a2e]"
                  : "border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {checkedA[i] && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </span>
            {/* No label text per spec */}
            <span className="w-24 h-3 bg-gray-200 rounded-full" />
          </label>
        ))}
      </div>

      {/* Group B */}
      <p className="font-bold text-gray-800 text-sm mb-3">Filters</p>
      <div className="space-y-2.5">
        {GROUP_TWO.map((_, i) => (
          <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
            <span
              onClick={() => toggleB(i)}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checkedB[i]
                  ? "bg-[#1a4a2e] border-[#1a4a2e]"
                  : "border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {checkedB[i] && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </span>
            <span className="w-20 h-3 bg-gray-200 rounded-full" />
          </label>
        ))}
      </div>
    </aside>
  );
}
