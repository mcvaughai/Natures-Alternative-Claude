import SectionHeader from "@/components/shared/SectionHeader";
import ProductCard from "@/components/shared/ProductCard";

type Category = "all" | "meat-seafood" | "fruits-vegetables";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: Exclude<Category, "all">;
}

const PRODUCTS: Product[] = [
  { id: 1,  name: "Pancakes",              description: "Fluffy buttermilk pancake mix made from stone-ground heirloom wheat.",        price: "$7.99",  category: "fruits-vegetables" },
  { id: 2,  name: "Product",               description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquip.",         price: "$4.99",  category: "fruits-vegetables" },
  { id: 3,  name: "Organic Tomatoes",      description: "Sun-ripened organic tomatoes harvested fresh from local farms.",              price: "$3.99",  category: "fruits-vegetables" },
  { id: 4,  name: "Heirloom Apples",       description: "Crisp heirloom apple varieties grown without synthetic pesticides.",          price: "$5.49",  category: "fruits-vegetables" },
  { id: 5,  name: "Wild Honey",            description: "Pure unfiltered wildflower honey harvested from our apiaries, 16 oz.",        price: "$12.99", category: "fruits-vegetables" },
  { id: 6,  name: "Free Range Eggs",       description: "A dozen farm-fresh eggs from pasture-raised, free-roaming hens.",            price: "$6.49",  category: "meat-seafood" },
  { id: 7,  name: "Sweet Potatoes",        description: "Naturally sweet, nutrient-dense potatoes dug fresh from rich garden soil.",   price: "$3.79",  category: "fruits-vegetables" },
  { id: 8,  name: "Grass-Fed Beef",        description: "100% grass-fed and finished ground beef, 1 lb vacuum-sealed pack.",          price: "$9.99",  category: "meat-seafood" },
  { id: 9,  name: "Baby Kale",             description: "Tender baby kale leaves packed with vitamins, ready to eat or cook.",         price: "$4.29",  category: "fruits-vegetables" },
  { id: 10, name: "Strawberries",          description: "Plump, vine-ripened strawberries picked at peak sweetness.",                  price: "$5.99",  category: "fruits-vegetables" },
  { id: 11, name: "Blueberries",           description: "Fresh-picked blueberries bursting with antioxidants and flavor.",             price: "$6.49",  category: "fruits-vegetables" },
  { id: 12, name: "Sourdough Loaf",        description: "Long-fermented sourdough baked in a stone oven with local heritage wheat.",   price: "$8.49",  category: "fruits-vegetables" },
  { id: 13, name: "Goat Cheese",           description: "Creamy chèvre-style goat cheese made fresh at a nearby family dairy.",        price: "$7.99",  category: "meat-seafood" },
  { id: 14, name: "Zucchini",             description: "Tender summer zucchini harvested young for the best flavor and texture.",      price: "$2.99",  category: "fruits-vegetables" },
  { id: 15, name: "Rainbow Carrots",       description: "A colorful mix of heirloom carrot varieties, sweet and earthy.",              price: "$3.49",  category: "fruits-vegetables" },
  { id: 16, name: "Broccoli",             description: "Dense, dark-green broccoli crowns harvested at peak nutritional value.",       price: "$3.29",  category: "fruits-vegetables" },
  { id: 17, name: "Heritage Pork Chops",  description: "Bone-in chops from heritage-breed hogs raised on open pasture.",              price: "$11.99", category: "meat-seafood" },
  { id: 18, name: "Mushroom Mix",          description: "Seasonal blend of chanterelle, oyster, and shiitake mushrooms.",              price: "$5.29",  category: "fruits-vegetables" },
  { id: 19, name: "Wild Salmon Fillet",   description: "Wild-caught Pacific salmon, skin-on fillet, sustainably harvested.",           price: "$14.99", category: "meat-seafood" },
  { id: 20, name: "Bell Peppers",          description: "Mixed red, yellow, and orange sweet bell peppers, vine-ripened.",             price: "$3.99",  category: "fruits-vegetables" },
];

interface Props {
  category?: string;
}

export default function AllProductsGrid({ category = "all" }: Props) {
  const filtered =
    category === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === category);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SectionHeader title="All Products" />
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} />
          ))}
        </div>
      )}
    </section>
  );
}
