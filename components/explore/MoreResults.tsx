import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

const MORE_PRODUCTS = [
  { id: 201, name: "Dried Lavender",     description: "Fragrant culinary lavender, dried and bundled from our herb garden.",      price: "$5.49"  },
  { id: 202, name: "Maple Syrup",        description: "Pure Grade A dark amber maple syrup, harvested from our sugar maples.",    price: "$13.99" },
  { id: 203, name: "Duck Eggs",          description: "Rich, creamy duck eggs from pasture-raised ducks — a pack of six.",        price: "$8.99"  },
  { id: 204, name: "Lamb Chops",         description: "Tender loin lamb chops from grass-fed lambs raised on open pasture.",      price: "$16.99" },
  { id: 205, name: "Beet Greens",        description: "Vibrant beet greens with earthy flavor, tender stems, rich in iron.",      price: "$3.29"  },
  { id: 206, name: "Fennel Bulb",        description: "Sweet anise-flavored fennel bulb, freshly trimmed and ready to use.",       price: "$3.79"  },
  { id: 207, name: "Heirloom Corn",      description: "Colorful heirloom corn varieties, decorative and perfect for meal prep.",  price: "$4.49"  },
  { id: 208, name: "Herbal Tea Blend",   description: "Hand-blended loose-leaf herbal tea with chamomile, mint, and lemon balm.", price: "$9.99"  },
  { id: 209, name: "Sunflower Seeds",    description: "Raw hulled sunflower seeds, fresh-harvested from our sunflower fields.",   price: "$4.29"  },
  { id: 210, name: "Bone Broth",         description: "Rich, slow-simmered beef bone broth from grass-fed cattle, 32 oz jar.",   price: "$11.49" },
];

export default function MoreResults() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="More Results" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {MORE_PRODUCTS.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} />
        ))}
      </div>
    </section>
  );
}
