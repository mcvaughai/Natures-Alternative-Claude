import SectionHeader from "@/components/shared/SectionHeader";
import StoreCard from "@/components/shared/StoreCard";

const STORES = [
  {
    id: "purple-food-crew",
    name: "Purple Food Crew",
    tagline: "Heirloom varieties and specialty produce grown by our three-generation family farm.",
  },
  {
    id: "force-of-nature",
    name: "Force of Nature",
    tagline: "Regenerative ranching for premium meats and pasture-raised dairy products.",
  },
  {
    id: "example-farms",
    name: "Example Farms",
    tagline: "Seasonal vegetables and fresh-cut herbs cultivated with care in rich valley soil.",
  },
  {
    id: "ww-farms",
    name: "W&W Farms",
    tagline: "A century of farming tradition — consistent quality you can taste in every bite.",
  },
];

export default function FeaturedStores() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="Featured Stores" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {STORES.map((store, i) => (
          <StoreCard key={i} {...store} />
        ))}
      </div>
    </section>
  );
}
