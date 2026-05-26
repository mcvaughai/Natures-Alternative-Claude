"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import { fetchFromSupabase, SUPABASE_URL, supabaseHeaders } from "@/lib/api";

interface Seller {
  slug: string;
  farm_name: string;
  description: string;
  fulfillment?: string[];
  banner_url?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  images: string[];
  seller_id: string;
  pricing_type?: string;
  price_per_pound?: number | null;
}

interface ProductUnit {
  id: string;
  product_id: string;
  weight_lbs: number;
  price: number;
  status: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  pricing_type?: string;
  price_per_pound?: number | null;
  images: string[];
}

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [quantity, setQuantity]         = useState(1);
  const [added, setAdded]               = useState(false);
  const [addedItems, setAddedItems]     = useState<{[key: string]: boolean}>({});
  const [product, setProduct]           = useState<Product | null>(null);
  const [seller, setSeller]             = useState<Seller | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [mainImage, setMainImage]       = useState<string>('');
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        // Step 1: fetch product
        const products = await fetchFromSupabase<Product[]>(
          `products?id=eq.${productId}&select=id,name,description,price,unit,images,seller_id,pricing_type,price_per_pound`
        );
        if (!products?.length) return;
        const productData = products[0];
        setProduct(productData);
        if (productData.images?.[0]) setMainImage(productData.images[0]);

        // Step 2: fetch seller
        const sellers = await fetchFromSupabase<Seller[]>(
          `sellers?id=eq.${productData.seller_id}&select=*`
        );
        if (sellers?.length) setSeller(sellers[0]);

        // Step 3: fetch related products from same seller
        const related = await fetchFromSupabase<RelatedProduct[]>(
          `products?seller_id=eq.${productData.seller_id}&status=eq.active&id=neq.${productId}&select=id,name,description,price,unit,pricing_type,price_per_pound,images&limit=4`
        );
        if (related?.length) setRelatedProducts(related);

        // Step 4: fetch available units for per_pound products
        if (productData.pricing_type === 'per_pound') {
          const unitsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/product_units?product_id=eq.${productData.id}&status=eq.available&select=*&order=weight_lbs.asc`,
            { headers: supabaseHeaders }
          );
          if (unitsRes.ok) {
            const unitsData = await unitsRes.json();
            setProductUnits(Array.isArray(unitsData) ? unitsData : []);
          }
        }
      } catch (err) {
        console.error("ProductDetail load error:", err);
      }
    }
    load();
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    const isPerPound = product.pricing_type === 'per_pound';

    if (isPerPound) {
      if (!selectedUnit) {
        alert('Please select a cut first.');
        return;
      }
      addToCart({
        id:          selectedUnit.id,
        name:        `${product.name} (${selectedUnit.weight_lbs} lbs)`,
        description: product.description,
        price:       `$${Number(selectedUnit.price).toFixed(2)}`,
        quantity:    1,
      });
    } else {
      addToCart({
        id:          product.id,
        name:        product.name,
        description: product.description,
        price:       `$${product.price.toFixed(2)}`,
        quantity,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  const isPerPound = product?.pricing_type === 'per_pound';
  const canAddToCart = !isPerPound || !!selectedUnit;

  const offersPickup   = Array.isArray(seller?.fulfillment) && seller.fulfillment.includes('Farm Pickup');
  const offersDelivery = Array.isArray(seller?.fulfillment) && seller.fulfillment.includes('Local Delivery');
  const offersShipping = Array.isArray(seller?.fulfillment) && seller.fulfillment.includes('Shipping');

  return (
    <div className="w-full px-6 py-8 flex gap-8 items-start">

      {/* LEFT — sticky image column */}
      <div style={{ width: '40%', flexShrink: 0, position: 'sticky', top: '170px' }}>
        <div className="flex gap-3">

          {/* Vertical thumbnail strip */}
          {product?.images && product.images.filter((img: string) => img).length > 1 && (
            <div className="flex flex-col gap-2" style={{ flexShrink: 0 }}>
              {product.images.filter((img: string) => img).map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setMainImage(img)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    border: mainImage === img ? '2px solid #053D2D' : '2px solid #e5e7eb',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div
            className="flex-1 overflow-hidden bg-gray-100"
            style={{ borderRadius: '12px', height: '480px' }}
          >
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={product?.name}
                className="w-full h-full object-cover"
                style={{ borderRadius: '12px' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE — product info */}
      <div className="flex flex-col" style={{ flex: 1 }}>

        {/* Product Name */}
        <h1 className="text-3xl font-bold text-gray-900 pb-4">
          {product?.name ?? "Loading..."}
        </h1>
        <div className="border-b border-gray-200" />

        {/* Star Rating */}
        <div className="flex items-center gap-1 py-4">
          {[1,2,3,4,5].map(star => (
            <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="text-gray-400 text-sm ml-1">(0 reviews)</span>
        </div>
        <div className="border-b border-gray-200" />

        {/* Price + Cuts */}
        <div className="py-4">
          {isPerPound ? (
            <div>
              <p className="text-3xl font-bold" style={{ color: '#053D2D' }}>
                ${Number(product?.price_per_pound ?? 0).toFixed(2)}/lb
              </p>
              {productUnits.length === 0 ? (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-500 text-sm font-medium">No cuts currently available</p>
                  <p className="text-gray-400 text-xs mt-1">Check back soon — new cuts are added regularly</p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Cut:</p>
                  <div className="flex flex-col gap-2">
                    {productUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        className="flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-colors"
                        style={{
                          borderColor: selectedUnit?.id === unit.id ? '#053D2D' : '#e5e7eb',
                          backgroundColor: selectedUnit?.id === unit.id ? '#f0fdf4' : 'white'
                        }}
                      >
                        <span className="font-medium">{unit.weight_lbs} lbs</span>
                        <span className="font-bold" style={{ color: '#053D2D' }}>
                          ${unit.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-3xl font-bold" style={{ color: '#053D2D' }}>
              ${product ? product.price.toFixed(2) : ''}/{product?.unit || 'each'}
            </p>
          )}
        </div>
        <div className="border-b border-gray-200" />

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed py-4">
          {product?.description ?? ""}
        </p>
        <div className="border-b border-gray-200" />

        {/* Fulfillment Badges */}
        {(offersPickup || offersDelivery || offersShipping) && (
          <div className="py-4 flex flex-wrap gap-2">
            {offersPickup && (
              <span className="font-medium rounded-full flex items-center gap-0.5"
                style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 12px' }}>
                🚗 Farm Pickup
              </span>
            )}
            {offersDelivery && (
              <span className="font-medium rounded-full flex items-center gap-0.5"
                style={{ fontSize: '12px', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 12px' }}>
                🚚 Local Delivery
              </span>
            )}
            {offersShipping && (
              <span className="font-medium rounded-full flex items-center gap-0.5"
                style={{ fontSize: '12px', backgroundColor: '#ede9fe', color: '#6d28d9', padding: '4px 12px' }}>
                📦 Ships Nationwide
              </span>
            )}
          </div>
        )}

        {/* Quantity Selector */}
        {!isPerPound && (
          <div className="flex items-center gap-4 pb-4">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          className={`w-full py-4 rounded-full text-white font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
            added ? 'bg-[#1a4a2e]' : canAddToCart ? 'hover:opacity-90' : 'bg-gray-300 cursor-not-allowed opacity-60'
          }`}
          style={canAddToCart && !added ? { backgroundColor: '#7a1515' } : {}}
          onClick={handleAddToCart}
          disabled={!product || !canAddToCart}
        >
          {added ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </>
          ) : !canAddToCart ? (
            <>Select a Cut First</>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Add to Cart
            </>
          )}
        </button>

        {/* Store Info Card */}
        {seller && (
          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">

            {/* Banner Image */}
            {seller.banner_url && (
              <div style={{ height: '140px', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={seller.banner_url}
                  alt={`${seller.farm_name} banner`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Store Info */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1">Sold by</p>
              <h3 className="font-bold text-gray-900 text-lg">{seller.farm_name}</h3>
<Link
                href={`/store/${seller.slug}`}
                className="mt-3 inline-block px-5 py-2 rounded-full text-white text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: '#053D2D' }}
              >
                Visit Store
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — More from this seller 2×2 grid */}
      <div className="flex flex-col gap-4" style={{ width: '300px', flexShrink: 0 }}>
        <h3 className="font-semibold text-gray-700 text-base">More from this seller</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {relatedProducts.slice(0, 4).map((rp) => (
            <Link
              key={rp.id}
              href={`/product/${rp.id}`}
              className="flex flex-col group"
              style={{ width: '143px' }}
            >
              <div
                className="overflow-hidden bg-gray-100"
                style={{ borderRadius: '8px', width: '143px', height: '164px', flexShrink: 0 }}
              >
                {rp.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rp.images[0]}
                    alt={rp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="mt-1.5">
                <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-green-900">
                  {rp.name}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color: '#053D2D' }}>
                  {rp.pricing_type === 'per_pound'
                    ? `$${rp.price_per_pound}/lb`
                    : `$${rp.price}/${rp.unit || 'each'}`
                  }
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <div className="flex justify-end mt-1">
                  <div className="relative">
                    {addedItems[rp.id] && (
                      <div
                        className="absolute pointer-events-none font-bold text-green-500"
                        style={{
                          top: '-18px',
                          right: '0px',
                          fontSize: '11px',
                          animation: 'floatUp 1.5s ease-out forwards'
                        }}
                      >
                        +1
                      </div>
                    )}
                    <button
                      className="relative text-white p-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: addedItems[rp.id] ? '#16a34a' : '#b91c1c',
                        transform: addedItems[rp.id] ? 'scale(1.15)' : 'scale(1)'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({
                          id: rp.id,
                          name: rp.name,
                          description: rp.description,
                          price: rp.pricing_type === 'per_pound'
                            ? `$${Number(rp.price_per_pound ?? 0).toFixed(2)}`
                            : `$${Number(rp.price).toFixed(2)}`,
                          quantity: 1,
                        });
                        setAddedItems(prev => ({ ...prev, [rp.id]: true }));
                        setTimeout(() => {
                          setAddedItems(prev => ({ ...prev, [rp.id]: false }));
                        }, 1500);
                      }}
                    >
                      <span
                        className="absolute bg-white rounded-full flex items-center justify-center font-bold"
                        style={{
                          top: '-6px',
                          right: '-6px',
                          width: '15px',
                          height: '15px',
                          fontSize: '10px',
                          color: addedItems[rp.id] ? '#16a34a' : '#b91c1c',
                          border: addedItems[rp.id] ? '1px solid #16a34a' : '1px solid #b91c1c'
                        }}
                      >
                        {addedItems[rp.id] ? '✓' : '+'}
                      </span>
                      {addedItems[rp.id] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
