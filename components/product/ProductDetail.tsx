"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";
import { useCart } from "@/lib/context/CartContext";
import { fetchFromSupabase } from "@/lib/api";

interface Seller {
  slug: string;
  farm_name: string;
  description: string;
}

interface WeightOption {
  weight_oz: number;
  label: string;
  in_stock: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller_id: string;
  pricing_type?: string;
  price_per_pound?: number | null;
  weight_input_mode?: string;
  weight_options?: WeightOption[] | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

const IMAGE_PLACEHOLDER = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [qty, setQty]                   = useState(1);
  const [added, setAdded]               = useState(false);
  const [product, setProduct]           = useState<Product | null>(null);
  const [seller, setSeller]             = useState<Seller | null>(null);
  const [moreProducts, setMoreProducts] = useState<RelatedProduct[]>([]);
  const [mainImage, setMainImage]       = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null);
  const [customWeight, setCustomWeight]     = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        // Step 1: fetch product
        const products = await fetchFromSupabase<Product[]>(
          `products?id=eq.${productId}&select=id,name,description,price,images,seller_id,pricing_type,price_per_pound,weight_input_mode,weight_options`
        );
        if (!products?.length) return;
        const productData = products[0];
        setProduct(productData);

        // Step 2: fetch seller
        const sellers = await fetchFromSupabase<Seller[]>(
          `sellers?id=eq.${productData.seller_id}&select=slug,farm_name,description`
        );
        if (sellers?.length) setSeller(sellers[0]);

        // Step 3: fetch more products from same seller
        const more = await fetchFromSupabase<RelatedProduct[]>(
          `products?seller_id=eq.${productData.seller_id}&status=eq.active&id=neq.${productId}&select=id,name,description,price,images&limit=4`
        );
        if (more?.length) setMoreProducts(more);
      } catch (err) {
        console.error("ProductDetail load error:", err);
      }
    }
    load();
  }, [productId]);

  // Sync mainImage when product data arrives
  useEffect(() => {
    if (product?.images?.[0]) setMainImage(product.images[0]);
  }, [product]);

  // Calculate price for per_pound products
  useEffect(() => {
    if (!product || product.pricing_type !== 'per_pound' || !product.price_per_pound) {
      setCalculatedPrice(null);
      return;
    }
    if (selectedWeight) {
      setCalculatedPrice((product.price_per_pound * selectedWeight.weight_oz) / 16);
    } else if (customWeight) {
      const lbs = parseFloat(customWeight);
      setCalculatedPrice(isNaN(lbs) ? null : product.price_per_pound * lbs);
    } else {
      setCalculatedPrice(null);
    }
  }, [product, selectedWeight, customWeight]);

  function getEffectivePrice(): number {
    if (!product) return 0;
    if (product.pricing_type === 'per_pound') return calculatedPrice ?? 0;
    return product.price;
  }

  function handleAddToCart() {
    if (!product) return;
    const isPerPound = product.pricing_type === 'per_pound';
    if (isPerPound && !selectedWeight && !customWeight) {
      alert('Please select or enter a weight before adding to cart.');
      return;
    }
    const effectivePrice = getEffectivePrice();
    const weightLabel = isPerPound
      ? (selectedWeight ? selectedWeight.label : `${customWeight} lbs`)
      : '';
    addToCart({
      id:          product.id,
      name:        weightLabel ? `${product.name} (${weightLabel})` : product.name,
      description: product.description,
      price:       `$${effectivePrice.toFixed(2)}`,
      quantity:    qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 lg:gap-8">

        {/* ── LEFT: Images ──────────────────────────────────────── */}
        <div>
          <div className="bg-gray-200 aspect-square rounded-2xl flex items-center justify-center text-gray-400 mb-3 overflow-hidden">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product?.name} className="w-full h-full object-cover" />
            ) : IMAGE_PLACEHOLDER}
          </div>

          {/* Thumbnails — only shown when product has more than 1 real image */}
          {product?.images && product.images.filter((img: string) => img && img !== '').length > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.images
                .filter((img: string) => img && img !== '')
                .map((img: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      mainImage === img ? 'border-green-900' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* ── MIDDLE: Details ───────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {product?.name ?? "Loading..."}
          </h1>

          <div className="mb-5">
            <span className="font-semibold text-gray-700 text-sm">Description:</span>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {product?.description ?? ""}
            </p>
          </div>

          {/* Price display */}
          {product?.pricing_type === 'per_pound' ? (
            <div className="mb-4">
              <p className="text-xl font-bold text-[#1a4a2e]">
                ${Number(product.price_per_pound ?? 0).toFixed(2)}<span className="text-base font-normal text-gray-500"> / lb</span>
              </p>
              {calculatedPrice !== null && (
                <p className="text-2xl font-bold text-[#1a4a2e] mt-1">
                  Total: ${calculatedPrice.toFixed(2)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-3xl font-bold text-[#1a4a2e] mb-4">
              {product ? `$${product.price.toFixed(2)}` : ""}
            </p>
          )}

          {/* Weight selector for per_pound products */}
          {product?.pricing_type === 'per_pound' && (
            <div className="mb-5">
              {product.weight_input_mode === 'preset' && product.weight_options?.length ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Weight:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.weight_options.filter(w => w.in_stock).map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setSelectedWeight(opt); setCustomWeight(''); }}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${
                          selectedWeight?.label === opt.label
                            ? 'border-[#1a4a2e] bg-[#1a4a2e] text-white'
                            : 'border-gray-300 text-gray-700 hover:border-[#1a4a2e]/50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {product.price_per_pound && (
                          <span className="ml-1.5 opacity-75 text-xs">
                            ${((product.price_per_pound * opt.weight_oz) / 16).toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                    {product.weight_options.filter(w => !w.in_stock).map((opt, i) => (
                      <button key={`out-${i}`} type="button" disabled
                        className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-400 line-through cursor-not-allowed">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Enter Weight (lbs):</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-36">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 1.5"
                        value={customWeight}
                        onChange={e => { setCustomWeight(e.target.value); setSelectedWeight(null); }}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                      />
                    </div>
                    <span className="text-sm text-gray-500">lbs</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Final price confirmed at pickup/delivery based on exact weight</p>
                </div>
              )}
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg leading-none transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-8 text-center border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a4a2e] focus:border-transparent"
                min={1}
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg leading-none transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product}
            className={`w-full ${added ? "bg-[#1a4a2e] hover:bg-[#2d6b47]" : "bg-[#8b1a1a] hover:bg-[#6d1414] active:bg-[#561010]"} text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm mb-6 text-base disabled:opacity-50`}
          >
            {added ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          {/* Store info card */}
          {seller && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h4 className="font-bold text-gray-900 text-base mb-1">{seller.farm_name}</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {seller.description ?? ""}
              </p>
              <button
                onClick={() => router.push(`/store/${seller.slug}`)}
                className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Visit Store
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: More from this seller ──────────────────────── */}
        <div>
          <h3 className="text-right text-sm font-semibold text-gray-700 mb-4">More from this seller</h3>
          <div className="grid grid-cols-2 gap-3">
            {moreProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                price={`$${p.price.toFixed(2)}`}
                imageUrl={p.images?.[0]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
