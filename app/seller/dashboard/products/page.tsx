"use client";

import { useState, useEffect, useCallback } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { SUPABASE_URL, supabaseHeaders } from "@/lib/api";
import { getValidSellerSession, getAuthHeaders } from "@/lib/sessionHelper";

const FILTER_TABS = ["All Products", "Active", "Draft", "Out of Stock"] as const;
type FilterTab = typeof FILTER_TABS[number];

interface Category { id: string; name: string; }

interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_qty: number | null;
  unit: string | null;
  in_stock: boolean;
  status: string;
  images: string[];
  category_id: string | null;
  categories: { name: string } | null;
  primaryImage: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  Active:         "bg-green-100 text-green-700",
  Draft:          "bg-gray-100 text-gray-600",
  "Out of Stock": "bg-red-100 text-red-600",
};

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function getDisplayStatus(p: DbProduct): string {
  if (!p.in_stock || p.stock_qty === 0) return "Out of Stock";
  if (p.status === "draft") return "Draft";
  return "Active";
}

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);


export default function ProductsPage() {
  const [tab, setTab]                   = useState<FilterTab>("All Products");
  const [search, setSearch]             = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [products, setProducts]         = useState<DbProduct[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loadingPage, setLoadingPage]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [sellerId, setSellerId]         = useState<string | null>(null);

  // Form state
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", stock: "", unit: "each",
  });
  const [selectedCategoryId, setSelectedCategoryId]     = useState("");
  const [productImages, setProductImages]                = useState<string[]>(['', '', '', '']);
  const [uploadingImageIndex, setUploadingImageIndex]    = useState<number | null>(null);

  // Variable weight pricing state
  const [pricingType, setPricingType]       = useState<'fixed' | 'per_pound'>('fixed');
  const [pricePerPound, setPricePerPound]   = useState('');

  // ── Fetch products + images via REST API ──────────────────────────────────
  const fetchProducts = useCallback(async (sid: string) => {
    try {
      const session = await getValidSellerSession();
      const headers = session?.access_token ? getAuthHeaders(session.access_token) : supabaseHeaders;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${sid}&select=id,name,description,price,stock_qty,unit,in_stock,status,images,category_id,categories(name)&order=created_at.desc`,
        { headers }
      );
      if (!response.ok) return;
      const rawProducts: (Omit<DbProduct, "primaryImage">)[] = await response.json() ?? [];
      if (rawProducts.length === 0) { setProducts([]); return; }

      // Batch-fetch all product_images for this seller's products
      const ids = rawProducts.map(p => p.id).join(",");
      const imgRes = await fetch(
        `${SUPABASE_URL}/rest/v1/product_images?product_id=in.(${ids})&select=product_id,url,is_primary&order=display_order.asc`,
        { headers }
      );
      const imageRows: { product_id: string; url: string; is_primary: boolean }[] =
        imgRes.ok ? (await imgRes.json() ?? []) : [];

      // Map productId → best image URL (prefer is_primary, else first)
      const imageMap = new Map<string, string>();
      for (const row of imageRows) {
        if (!imageMap.has(row.product_id) || row.is_primary) {
          imageMap.set(row.product_id, row.url);
        }
      }

      setProducts(rawProducts.map(p => ({
        ...p,
        primaryImage: imageMap.get(p.id) ?? p.images?.[0] ?? null,
      })));
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  // ── Init: check auth from localStorage, then REST for data ───────────────
  useEffect(() => {
    async function init() {
      try {
        const session = await getValidSellerSession();
        if (!session?.access_token) return;

        setSellerId(session.seller_id);

        // Fetch categories via REST
        const catRes = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=id,name&order=sort_order`,
          { headers: supabaseHeaders }
        );
        if (catRes.ok) {
          const cats = await catRes.json();
          if (cats) setCategories(cats);
        }

        await fetchProducts(session.seller_id);
      } catch (err) {
        console.error("Products page init error:", err);
        window.location.href = "/seller/login";
      } finally {
        setLoadingPage(false);
      }
    }
    init();
  }, [fetchProducts]);

  // ── Upload one image slot to storage and update productImages state ──────────
  const uploadProductImage = async (file: File, productId: string, index: number) => {
    try {
      setUploadingImageIndex(index);
      const session = await getValidSellerSession();
      if (!session?.access_token) return;
      const authHeaders = getAuthHeaders(session.access_token);

      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}-image-${index}-${Date.now()}.${fileExt}`;

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": file.type, "x-upsert": "true" },
          body: file,
        }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        alert("Upload failed: " + err);
        return;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
      setProductImages(prev => {
        const next = [...prev];
        next[index] = publicUrl;
        return next;
      });
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const resetForm = () => {
    setProductForm({ name: "", description: "", price: "", stock: "", unit: "each" });
    setSelectedCategoryId("");
    setEditingProduct(null);
    setProductImages(['', '', '', '']);
    setPricingType('fixed');
    setPricePerPound('');
  };

  // ── Open form in edit mode ─────────────────────────────────────────────────
  const handleEditClick = (product: DbProduct) => {
    setEditingProduct(product);
    setShowForm(true);
    setProductForm({
      name:        product.name,
      description: product.description ?? "",
      price:       product.price.toString(),
      stock:       product.stock_qty?.toString() ?? "",
      unit:        product.unit ?? "each",
    });
    setSelectedCategoryId(product.category_id ?? "");
    const existingImages = product.images || [];
    setProductImages([
      existingImages[0] || '',
      existingImages[1] || '',
      existingImages[2] || '',
      existingImages[3] || '',
    ]);
    const p = product as any;
    setPricingType(p.pricing_type || 'fixed');
    setPricePerPound(p.price_per_pound?.toString() || '');
    setTimeout(() => {
      document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ── Add product ───────────────────────────────────────────────────────────
  const saveProduct = async (isActive: boolean) => {
    if (!sellerId)                { alert("Seller profile not found. Please log in again."); return; }
    if (!productForm.name.trim()) { alert("Please enter a product name."); return; }
    if (pricingType === 'fixed' && !productForm.price)     { alert("Please enter a price."); return; }
    if (pricingType === 'per_pound' && !pricePerPound)     { alert("Please enter a price per pound."); return; }

    setSaving(true);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;

      const slug =
        productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
        "-" + Date.now().toString(36);

      const authHeaders = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };

      console.log("Saving product for seller:", sellerId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let response: Response;
      try {
        response = await fetch(
          `${SUPABASE_URL}/rest/v1/products`,
          {
            method:  "POST",
            headers: authHeaders,
            signal:  controller.signal,
            body: JSON.stringify({
              seller_id:   sellerId,
              name:        productForm.name.trim(),
              slug,
              description: productForm.description.trim() || null,
              price:       pricingType === 'per_pound' ? parseFloat(pricePerPound) : parseFloat(productForm.price),
              stock_qty:   productForm.stock ? parseInt(productForm.stock) : null,
              in_stock:    productForm.stock ? parseInt(productForm.stock) > 0 : true,
              unit:        productForm.unit || null,
              category_id: selectedCategoryId || null,
              images:           productImages.filter(img => img !== ''),
              status:           isActive ? "active" : "draft",
              pricing_type:     pricingType,
              price_per_pound:  pricingType === 'per_pound' ? parseFloat(pricePerPound) || null : null,
            }),
          }
        );
      } finally {
        clearTimeout(timeoutId);
      }

      console.log("Save response status:", response.status);
      if (!response.ok) {
        const errText = await response.text();
        console.error("Save error:", errText);
        alert("Error saving product: " + errText);
        return;
      }

      alert(isActive ? "Product published successfully!" : "Product saved as draft!");
      resetForm();
      setShowForm(false);
      await fetchProducts(sellerId);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Error: " + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Update product via REST PATCH ──────────────────────────────────────────
  const updateProduct = async () => {
    if (!editingProduct)          { return; }
    if (!productForm.name.trim()) { alert("Please enter a product name."); return; }
    if (pricingType === 'fixed' && !productForm.price)     { alert("Please enter a price."); return; }
    if (pricingType === 'per_pound' && !pricePerPound)     { alert("Please enter a price per pound."); return; }

    setSaving(true);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;

      const authHeaders = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };

      console.log("Updating product:", editingProduct.id);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let response: Response;
      try {
        response = await fetch(
          `${SUPABASE_URL}/rest/v1/products?id=eq.${editingProduct.id}`,
          {
            method: "PATCH",
            headers: authHeaders,
            signal: controller.signal,
            body: JSON.stringify({
              name:        productForm.name.trim(),
              description: productForm.description.trim() || null,
              price:       pricingType === 'per_pound' ? parseFloat(pricePerPound) : parseFloat(productForm.price),
              stock_qty:   productForm.stock ? parseInt(productForm.stock) : null,
              in_stock:    productForm.stock ? parseInt(productForm.stock) > 0 : true,
              unit:        productForm.unit || null,
              category_id: selectedCategoryId || null,
              images:           productImages.filter(img => img !== ''),
              pricing_type:     pricingType,
              price_per_pound:  pricingType === 'per_pound' ? parseFloat(pricePerPound) || null : null,
              updated_at:       new Date().toISOString(),
            }),
          }
        );
      } finally {
        clearTimeout(timeoutId);
      }

      console.log("Update response status:", response.status);
      if (!response.ok) {
        const errText = await response.text();
        console.error("Update error:", errText);
        alert("Error updating product: " + errText);
        return;
      }

      alert("Product updated successfully!");
      resetForm();
      setShowForm(false);
      if (sellerId) await fetchProducts(sellerId);
    } catch (err) {
      console.error("Catch error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        alert("Update timed out. Please try again.");
      } else {
        alert("Error: " + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product via REST DELETE ─────────────────────────────────────────
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;

      const authHeaders = getAuthHeaders(session.access_token);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let response: Response;
      try {
        response = await fetch(
          `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
          { method: "DELETE", headers: authHeaders, signal: controller.signal }
        );
      } finally {
        clearTimeout(timeoutId);
      }

      console.log("Delete response status:", response.status);
      if (!response.ok) {
        const errText = await response.text();
        console.error("Delete error:", errText);
        alert("Error deleting product: " + errText);
        return;
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Error: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // ── Toggle active / draft via REST PATCH ───────────────────────────────────
  const toggleStatus = async (p: DbProduct) => {
    const newStatus = p.status === "active" ? "draft" : "active";
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;

      const authHeaders = getAuthHeaders(session.access_token);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        await fetch(
          `${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`,
          {
            method: "PATCH",
            headers: authHeaders,
            signal: controller.signal,
            body: JSON.stringify({ status: newStatus }),
          }
        );
      } finally {
        clearTimeout(timeoutId);
      }

      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Error toggling status: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const ds = getDisplayStatus(p);
    const matchTab    = tab === "All Products" || ds === tab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const isEditing = !!editingProduct;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SellerLayout>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <button
            onClick={() => {
              if (showForm) { setShowForm(false); resetForm(); }
              else { resetForm(); setShowForm(true); }
            }}
            className="flex items-center gap-1.5 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add New Product
          </button>
        </div>

        {/* ── Add / Edit Product Form ── */}
        {showForm && (
          <div id="product-form" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <div className="space-y-4">

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                  <input type="text" placeholder="e.g. Fresh Strawberries" className={inputCls}
                    value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}
                      className={inputCls + " appearance-none"}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                  <input type="number" placeholder="0" min="0" className={inputCls}
                    value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                  <input type="text" placeholder="e.g. lb, each, dozen" className={inputCls}
                    value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
              </div>

              {/* Pricing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setPricingType('fixed')}
                    className={`flex-1 py-2 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${pricingType === 'fixed' ? 'border-[#1a4a2e] bg-[#1a4a2e] text-white' : 'border-gray-300 text-gray-600 hover:border-[#1a4a2e]/50'}`}>
                    Fixed Price
                  </button>
                  <button type="button" onClick={() => setPricingType('per_pound')}
                    className={`flex-1 py-2 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${pricingType === 'per_pound' ? 'border-[#1a4a2e] bg-[#1a4a2e] text-white' : 'border-gray-300 text-gray-600 hover:border-[#1a4a2e]/50'}`}>
                    Price Per Pound
                  </button>
                </div>
              </div>

              {/* Fixed price input */}
              {pricingType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" placeholder="0.00" min="0" step="0.01" className={inputCls + " pl-7"}
                      value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* Per pound options */}
              {pricingType === 'per_pound' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Per Pound</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        value={pricePerPound}
                        onChange={e => setPricePerPound(e.target.value)}
                        className={inputCls + " pl-7"}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">e.g. $45.00/lb</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      💡 After saving this product, go to <strong>Inventory</strong> to add individual units with their specific weights. Each unit will be listed separately for customers to choose from.
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe your product..." className={inputCls + " resize-none"}
                  value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Image upload — 4 slots */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Images (up to 4)
                </label>
                <p className="text-xs text-gray-400 mb-3">First image will be the main product photo</p>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div
                        className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center relative"
                        style={{ minHeight: '120px' }}
                      >
                        {productImages[index] ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={productImages[index]}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProductImages(prev => {
                                  const next = [...prev];
                                  next[index] = '';
                                  return next;
                                });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </>
                        ) : uploadingImageIndex === index ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900 mx-auto" />
                            <p className="text-xs text-gray-400 mt-1">Uploading...</p>
                          </div>
                        ) : (
                          <div className="text-center p-2">
                            <p className="text-2xl text-gray-300">+</p>
                            <p className="text-xs text-gray-400">
                              {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                            </p>
                          </div>
                        )}
                      </div>
                      {!productImages[index] && uploadingImageIndex !== index && (
                        <label className="absolute inset-0 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;
                              const tempId = editingProduct?.id || `temp-${Date.now()}`;
                              await uploadProductImage(e.target.files[0], tempId, index);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                      Cancel
                    </button>
                    <button onClick={updateProduct} disabled={saving}
                      className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                      {saving && <Spinner />}
                      Update Product
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => saveProduct(false)} disabled={saving}
                      className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving && <Spinner />}
                      Save as Draft
                    </button>
                    <button onClick={() => saveProduct(true)} disabled={saving}
                      className="flex-1 bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                      {saving && <Spinner />}
                      Publish Product
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Product list ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filter tabs + search */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            <div className="flex overflow-x-auto">
              {FILTER_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg mr-1 transition-colors ${tab === t ? "bg-[#1a4a2e] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <input type="search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition w-52"/>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/>
              </svg>
            </div>
          </div>

          {loadingPage ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              {tab === "All Products"
                ? "No products yet. Click \"Add New Product\" to get started."
                : `No ${tab.toLowerCase()} products.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Image","Product","Category","Price","Stock","Status","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(p => {
                    const ds = getDisplayStatus(p);
                    return (
                      <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${editingProduct?.id === p.id ? "bg-amber-50/50" : ""}`}>
                        <td className="px-4 py-3">
                          {(p.primaryImage || p.images?.[0]) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.primaryImage || p.images[0]} alt={p.name}
                              className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.categories?.name ?? "—"}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800 tabular-nums">${Number(p.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-700">{p.stock_qty ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ds]}`}>{ds}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                              Delete
                            </button>
                            <button
                              onClick={() => toggleStatus(p)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${p.status === "active" ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
                              aria-label="Toggle status">
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${p.status === "active" ? "translate-x-4" : "translate-x-0"}`}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
