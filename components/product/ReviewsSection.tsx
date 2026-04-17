function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 ${i < rating ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-200 stroke-gray-300"}`}
          viewBox="0 0 24 24"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
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
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-h-[160px]" />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Review:</p>
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{text}</p>
      <StarRating rating={stars ?? 0} />
      {reviewer && (
        <p className="text-gray-500 text-xs mt-3 italic">{reviewer}</p>
      )}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">What people think of this product</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReviewCard
          text="Below the snowline. Caradhras is described as having dull red slopes, 'as if stained with blood'."
          stars={3}
          reviewer="- Margaret"
        />
        <ReviewCard isEmpty />
        <ReviewCard isEmpty />
        <ReviewCard isEmpty />
      </div>
    </section>
  );
}
