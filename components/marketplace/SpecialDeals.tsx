import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

const DEALS = [
  { name: "Apple Cider Vinegar",  description: "Organic ACV with the mother culture, raw and unfiltered, 32 oz.",    price: "$8.49" },
  { name: "Mixed Wild Berries",   description: "A seasonal blend of freshly picked blueberries, blackberries & more.", price: "$5.99" },
  { name: "Heritage Pork Chops",  description: "Bone-in chops from heritage-breed hogs raised on open pasture.",      price: "$11.99" },
  { name: "Fresh Basil Bundle",   description: "Fragrant Genovese basil, hand-cut and bunched to order daily.",        price: "$2.99" },
];

export default function SpecialDeals() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="Special Deals" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {DEALS.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </section>
  );
}
