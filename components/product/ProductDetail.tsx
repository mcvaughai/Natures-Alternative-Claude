"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import { fetchFromSupabase, SUPABASE_URL, supabaseHeaders } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

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
  category_id?: string | null;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [similarStores, setSimilarStores]     = useState<any[]>([]);
  const [reviewRating, setReviewRating]       = useState(0);
  const [reviewText, setReviewText]           = useState('');
  const [reviewTitle, setReviewTitle]         = useState('');
  const [reviews, setReviews]                 = useState<any[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess]     = useState(false);
  const [category, setCategory]               = useState<{ name: string; slug: string } | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        // Step 1: fetch product
        const products = await fetchFromSupabase<Product[]>(
          `products?id=eq.${productId}&select=id,name,description,price,unit,images,seller_id,pricing_type,price_per_pound,category_id`
        );
        if (!products?.length) return;
        const productData = products[0];
        setProduct(productData);
        if (productData.images?.[0]) setMainImage(productData.images[0]);

        // Step 1b: fetch category for breadcrumb
        if (productData.category_id) {
          const catRes = await fetch(
            `${SUPABASE_URL}/rest/v1/categories?id=eq.${productData.category_id}&select=name,slug`,
            { headers: supabaseHeaders }
          );
          if (catRes.ok) {
            const catData = await catRes.json();
            if (Array.isArray(catData) && catData[0]) setCategory(catData[0]);
          }
        }

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

        // Step 5: fetch similar products (same category)
        if (productData.category_id) {
          const similarRes = await fetch(
            `${SUPABASE_URL}/rest/v1/products?category_id=eq.${productData.category_id}&id=neq.${productData.id}&status=eq.active&select=*&limit=4&order=created_at.desc`,
            { headers: supabaseHeaders }
          );
          if (similarRes.ok) {
            const similarData = await similarRes.json();
            if (Array.isArray(similarData) && similarData.length > 0) {
              const sellersRes = await fetch(
                `${SUPABASE_URL}/rest/v1/sellers?select=id,farm_name,slug,fulfillment`,
                { headers: supabaseHeaders }
              );
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sellersMap: Record<string, any> = {};
              if (sellersRes.ok) {
                const sellersData = await sellersRes.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (Array.isArray(sellersData)) sellersData.forEach((s: any) => { sellersMap[s.id] = s; });
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setSimilarProducts(similarData.map((p: any) => ({ ...p, sellers: sellersMap[p.seller_id] || null })));
            }
          }
        }

        // Step 6: fetch similar stores (other approved sellers)
        const storesRes = await fetch(
          `${SUPABASE_URL}/rest/v1/sellers?status=eq.approved&id=neq.${productData.seller_id}&select=id,farm_name,slug,banner_url,logo_url,city,state,description,tagline&limit=4`,
          { headers: supabaseHeaders }
        );
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          setSimilarStores(Array.isArray(storesData) ? storesData : []);
        }

        // Step 7: fetch reviews for this product
        const reviewsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?product_id=eq.${productId}&select=*,profiles(first_name,last_name,avatar_url)&order=created_at.desc`,
          { headers: supabaseHeaders }
        );
        const reviewsData = await reviewsRes.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      } catch (err) {
        console.error("ProductDetail load error:", err);
      }
    }
    load();
  }, [productId]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function submitReview() {
    if (!reviewRating) { alert('Please select a star rating'); return; }
    if (!reviewText.trim()) { alert('Please write a review'); return; }

    const sessionStr = localStorage.getItem('customer_session');
    if (!sessionStr) {
      alert('Please log in to submit a review');
      window.location.href = '/login';
      return;
    }
    const sess = JSON.parse(sessionStr);

    setSubmittingReview(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          Authorization: `Bearer ${sess.access_token}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          product_id: productId,
          user_id:    sess.user_id,
          rating:     reviewRating,
          body:       reviewText.trim(),
          title:      reviewTitle.trim() || null,
          verified:   false,
          created_at: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => [newReview[0], ...prev]);
        setReviewRating(0);
        setReviewText('');
        setReviewTitle('');
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
      } else {
        const err = await res.text();
        console.error('Review error:', err);
        alert('Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

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
    <>
    {/* Breadcrumb */}
    <nav className="w-full px-6 py-5 flex items-center" style={{ fontSize: '13px', borderBottom: '0.5px solid #e5e7eb' }}>
      <Link href="/" style={{ color: '#6b7280' }} className="hover:underline whitespace-nowrap">
        Home
      </Link>
      <span style={{ color: '#9ca3af', margin: '0 6px' }}>›</span>
      {category ? (
        <>
          <Link
            href={`/category/${category.slug}`}
            style={{ color: '#6b7280' }}
            className="hover:underline whitespace-nowrap"
          >
            {category.name}
          </Link>
          <span style={{ color: '#9ca3af', margin: '0 6px' }}>›</span>
        </>
      ) : null}
      <span
        style={{ color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {product?.name ?? ''}
      </span>
    </nav>

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
        <h1 className="font-raleway text-3xl font-bold text-gray-900 pb-4">
          {product?.name ?? "Loading..."}
        </h1>
        <div className="border-b border-gray-200" />

        {/* Star Rating */}
        <div className="flex items-center gap-1 py-4">
          {[1,2,3,4,5].map(star => (
            <svg
              key={star}
              width="16" height="16" viewBox="0 0 24 24"
              fill={star <= Math.round(averageRating) ? '#f59e0b' : 'none'}
              stroke={star <= Math.round(averageRating) ? '#f59e0b' : '#d1d5db'}
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="text-sm ml-1" style={{ color: '#00674B' }}>
            {reviews.length > 0
              ? `${averageRating.toFixed(1)} (${reviews.length} review${reviews.length > 1 ? 's' : ''})`
              : '(0 reviews)'
            }
          </span>
        </div>
        <div className="border-b border-gray-200" />

        {/* Price + Cuts */}
        <div className="py-4">
          {isPerPound ? (
            <div>
              <p className="font-urbanist text-3xl font-bold" style={{ color: '#053D2D' }}>
                ${Number(product?.price_per_pound ?? 0).toFixed(2)}/lb
              </p>
              {productUnits.length === 0 ? (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-500 text-sm font-medium">No cuts currently available</p>
                  <p className="text-gray-400 text-xs mt-1">Check back soon — new cuts are added regularly</p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="font-urbanist text-sm font-medium text-gray-700 mb-2">Select Cut:</p>
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
        <p className="font-urbanist text-gray-600 text-sm leading-relaxed py-4">
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
            <span className="font-urbanist text-gray-700 font-medium">Quantity:</span>
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
          className={`font-urbanist w-full py-4 rounded-full text-white font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
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
              <p className="font-urbanist text-xs text-gray-500 mb-1">Sold by</p>
              <h3 className="font-raleway font-bold text-gray-900 text-lg">{seller.farm_name}</h3>
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
        <h3 className="font-raleway font-semibold text-gray-700 text-base">More from this seller</h3>
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

      {/* ── SECTION 1: Similar Products ─────────────────────────────── */}
      {similarProducts.length > 0 && (
        <div className="w-full px-6 py-8 border-t border-gray-100">
          <h2 className="font-raleway text-2xl font-semibold text-gray-900 mb-6">
            Similar Items
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {similarProducts.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(p) => {
                  addToCart({
                    id:    p.id,
                    name:  p.name,
                    price: `$${Number(p.pricing_type === 'per_pound' ? (p.price_per_pound ?? 0) : (p.price ?? 0)).toFixed(2)}`,
                    quantity: 1,
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 2: Reviews ──────────────────────────────────────── */}
      <div className="w-full px-6 py-8 border-t border-gray-100">
        <h2 className="font-raleway text-2xl font-semibold text-gray-900 mb-6">
          What People Think of This Product
        </h2>

        <div className="flex gap-8">
          {/* Reviews list */}
          <div className="flex-1 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-500 font-medium">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to review this product</p>
              </div>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: '#053D2D' }}
                      >
                        {review.profiles?.first_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {review.profiles?.first_name && review.profiles?.last_name
                            ? `${review.profiles.first_name} ${review.profiles.last_name}`
                            : review.profiles?.first_name
                            ? review.profiles.first_name
                            : 'Anonymous'
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.verified && (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} width="12" height="12" viewBox="0 0 24 24"
                            fill={star <= review.rating ? '#f59e0b' : 'none'}
                            stroke={star <= review.rating ? '#f59e0b' : '#d1d5db'}
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a review */}
          <div className="w-80 flex-shrink-0">
            <h3 className="font-raleway font-semibold text-gray-900 mb-4">Share Your Thoughts</h3>

            {reviewSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-3">
                ✅ Review submitted successfully! Thank you.
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setReviewRating(star)} className="transition-colors">
                    <svg width="28" height="28" viewBox="0 0 24 24"
                      fill={star <= reviewRating ? '#f59e0b' : 'none'}
                      stroke={star <= reviewRating ? '#f59e0b' : '#d1d5db'}
                      strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Title (optional)
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={e => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
            />

            <button
              onClick={submitReview}
              disabled={submittingReview}
              className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#053D2D' }}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Similar Stores ───────────────────────────────── */}
      {similarStores.length > 0 && (
        <div className="w-full px-6 py-8 border-t border-gray-100">
          <h2 className="font-raleway text-2xl font-semibold text-gray-900 mb-6">
            Similar Stores
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {similarStores.map((store: any) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="group rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
              >
                {/* Banner */}
                <div className="w-full overflow-hidden bg-gray-200" style={{ height: '120px' }}>
                  {store.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.banner_url}
                      alt={store.farm_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#053D2D' }}>
                      <span className="text-white font-raleway font-bold text-lg">
                        {store.farm_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  {store.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={store.logo_url} alt={store.farm_name} className="w-10 h-10 object-contain mb-2" />
                  )}
                  <h3 className="font-raleway font-semibold text-gray-900 text-sm">{store.farm_name}</h3>
                  {store.city && store.state && (
                    <p className="text-xs text-gray-500 mt-0.5">{store.city}, {store.state}</p>
                  )}
                  {store.tagline && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{store.tagline}</p>
                  )}
                  <span className="mt-2 inline-block text-xs font-medium px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#053D2D' }}>
                    Visit Store
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
