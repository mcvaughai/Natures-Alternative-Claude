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
    id: "natures-alternative",
    name: "Natures Alternative",
    tagline: "Farm-fresh pantry staples and baked goods straight from our kitchen to yours.",
  },
  {
    id: "ww-farms",
    name: "W&W Farms",
    tagline: "A century of farming tradition — consistent quality you can taste in every bite.",
  },
];

export default function SimilarStores() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Similar Stores</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STORES.map((store) => (
          <StoreCard
            key={store.id}
            id={store.id}
            name={store.name}
            tagline={store.tagline}
            showBookmark
          />
        ))}
      </div>
    </section>
  );
}
