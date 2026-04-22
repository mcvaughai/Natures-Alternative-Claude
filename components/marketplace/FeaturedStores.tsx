import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import FarmCard, { FarmCardData } from "@/components/shared/FarmCard";

const FARMS: FarmCardData[] = [
  {
    id:           "purple-food-crew",
    name:         "Purple Food Crew",
    location:     "Houston, TX",
    description:  "Heirloom varieties and specialty produce grown by our three-generation family farm.",
    categories:   ["Fruits & Vegetables", "Herbs & Botanicals"],
    fulfillment:  ["Pickup", "Ships"],
    rating:       4.7,
    reviewCount:  18,
    productCount: 16,
  },
  {
    id:           "force-of-nature",
    name:         "Force of Nature",
    location:     "Austin, TX",
    description:  "Regenerative ranching for premium meats and pasture-raised products.",
    categories:   ["Meat & Poultry"],
    fulfillment:  ["Ships", "Delivery"],
    rating:       4.8,
    reviewCount:  31,
    productCount: 8,
  },
  {
    id:           "example-farms",
    name:         "Example Farms",
    location:     "Houston, TX",
    description:  "Seasonal vegetables and fresh-cut herbs cultivated with care in rich valley soil.",
    categories:   ["Meat & Poultry", "Dairy & Eggs"],
    fulfillment:  ["Pickup", "Delivery"],
    rating:       4.9,
    reviewCount:  42,
    productCount: 24,
  },
  {
    id:           "ww-farms",
    name:         "W&W Farms",
    location:     "Dallas, TX",
    description:  "A century of farming tradition — consistent quality you can taste in every bite.",
    categories:   ["Dairy & Eggs", "Bakery & Breads"],
    fulfillment:  ["Pickup"],
    rating:       4.6,
    reviewCount:  12,
    productCount: 11,
  },
];

export default function FeaturedStores() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="Featured Farms" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {FARMS.map((farm) => (
          <FarmCard key={farm.id} {...farm} />
        ))}
      </div>
      <div className="text-center mt-6">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 border-2 border-[#1a4a2e] text-[#1a4a2e] hover:bg-[#1a4a2e] hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Browse All Farms
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
