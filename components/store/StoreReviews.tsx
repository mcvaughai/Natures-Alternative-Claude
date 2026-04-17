"use client";
import { useState } from "react";

const STAR_PATH =
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z";

// Read-only star display — supports half-stars (e.g. rating=2.5)
function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const pos = i + 1;
        const full = pos <= Math.floor(rating);
        const half = !full && pos - 0.5 <= rating;

        if (half) {
          return (
            <div key={i} className="relative w-4 h-4 shrink-0">
              {/* Gray empty star underneath */}
              <svg className="absolute w-4 h-4 fill-gray-200 stroke-gray-300" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
              </svg>
              {/* Yellow star clipped to left half */}
              <svg
                className="absolute w-4 h-4 fill-yellow-400 stroke-yellow-400"
                viewBox="0 0 24 24"
                strokeWidth={1}
                style={{ clipPath: "inset(0 50% 0 0)" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
              </svg>
            </div>
          );
        }

        return (
          <svg
            key={i}
            className={`w-4 h-4 ${full ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-200 stroke-gray-300"}`}
            viewBox="0 0 24 24"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
          </svg>
        );
      })}
    </div>
  );
}

// Clickable star input for submitting a review
function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <svg
            className={`w-7 h-7 transition-colors ${
              (hover || value) >= star
                ? "fill-yellow-400 stroke-yellow-400"
                : "fill-gray-200 stroke-gray-300"
            }`}
            viewBox="0 0 24 24"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  text?: string;
  stars?: number;
  reviewer?: string;
  isEmpty?: boolean;
}

function ReviewCard({ text, stars = 0, reviewer, isEmpty = false }: ReviewCardProps) {
  if (isEmpty) {
    return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-h-[160px]" />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Review:</p>
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{text}</p>
      <StarDisplay rating={stars} />
      {reviewer && <p className="text-gray-500 text-xs mt-3 italic">{reviewer}</p>}
    </div>
  );
}

export default function StoreReviews() {
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  function handleSubmit() {
    // Placeholder: wire to review submission API when ready
    console.log("Store review submitted:", { reviewText, reviewRating });
    setReviewText("");
    setReviewRating(0);
  }

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-12 uppercase tracking-wider">
          What People Think of Us
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left column: 2 stacked review cards */}
          <div className="space-y-4">
            <ReviewCard
              text="Below the snowline. Caradhras is described as having dull red slopes, 'as if stained with blood'."
              stars={2.5}
              reviewer="- Margaret"
            />
            <ReviewCard isEmpty />
          </div>

          {/* Right column: review submission form */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Share your thoughts!</h3>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-48 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent mb-5"
            />

            <div className="mb-6">
              <InteractiveStars value={reviewRating} onChange={setReviewRating} />
            </div>

            <button
              onClick={handleSubmit}
              className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-2.5 rounded-full text-sm font-semibold transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
