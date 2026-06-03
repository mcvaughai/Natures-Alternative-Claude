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
  price_per_pound: number | null;
  pricing_type: string | null;
  stock_quantity: number | null;
  unit: string | null;
  status: string;
  images: string[];
  category_id: string | null;
  categories: { name: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  Active:         "bg-green-100 text-green-700",
  Draft:          "bg-gray-100 text-gray-600",
  "Out of Stock": "bg-red-100 text-red-600",
};

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition";

function getDisplayStatus(p: DbProduct): string {
  if (p.status === "draft") return "Draft";
  if (p.stock_quantity !== null && p.stock_quantity === 0) return "Out of Stock";
  return "Active";
}

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-5 first:mt-0">
    {children}
  </p>
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
  const [formStatus, setFormStatus]                      = useState<'active' | 'draft'>('draft');

  // Variable weight pricing state
  const [pricingType, setPricingType]       = useState<'fixed' | 'per_pound'>('fixed');
  const [pricePerPound, setPricePerPound]   = useState('');

  // ── Fetch products via REST API ───────────────────────────────────────────
  const fetchProducts = useCallback(async (sid: string) => {
    try {
      const session = await getValidSellerSession();
      const headers = session?.access_token ? getAuthHeaders(session.access_token) : supabaseHeaders;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?seller_id=eq.${sid}&select=id,name,description,price,price_per_pound,pricing_type,stock_quantity,unit,status,images,category_id,categories(name)&order=created_at.desc`,
        { headers }
      );
      if (!response.ok) return;
      const data: DbProduct[] = await response.json() ?? [];
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const session = await getValidSellerSession();
        if (!session?.access_token) return;

        setSellerId(session.seller_id);

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

  // ── Upload image to Supabase Storage ──────────────────────────────────────
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
    setFormStatus('draft');
  };

  // ── Open form in edit mode ────────────────────────────────────────────────
  const handleEditClick = (product: DbProduct) => {
    setEditingProduct(product);
    setShowForm(true);
    setProductForm({
      name:        product.name,
      description: product.description ?? "",
      price:       product.price.toString(),
      stock:       product.stock_quantity?.toString() ?? "",
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
    setPricingType((product.pricing_type as 'fixed' | 'per_pound') || 'fixed');
    setPricePerPound(product.price_per_pound?.toString() || '');
    setFormStatus(product.status === 'active' ? 'active' : 'draft');
    setTimeout(() => {
      document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ── Add product ───────────────────────────────────────────────────────────
  const saveProduct = async (isActive: boolean) => {
    if (!sellerId)                { alert("Seller profile not found. Please log in again."); return; }
    if (!productForm.name.trim()) { alert("Please enter a product name."); return; }
    if (pricingType === 'fixed' && !productForm.price)  { alert("Please enter a price."); return; }
    if (pricingType === 'per_pound' && !pricePerPound)  { alert("Please enter a price per pound."); return; }

    setSaving(true);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;

      const slug =
        productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
        "-" + Date.now().toString(36);

      const authHeaders = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };

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
              seller_id:      sellerId,
              name:           productForm.name.trim(),
              slug,
              description:    productForm.description.trim() || null,
              price:          pricingType === 'per_pound' ? parseFloat(pricePerPound) : parseFloat(productForm.price),
              stock_quantity: productForm.stock ? parseInt(productForm.stock) : null,
              unit:           productForm.unit || null,
              category_id:    selectedCategoryId || null,
              images:         productImages.filter(img => img !== ''),
              status:         isActive ? "active" : "draft",
              pricing_type:   pricingType,
              price_per_pound: pricingType === 'per_pound' ? parseFloat(pricePerPound) || null : null,
            }),
          }
        );
      } finally {
        clearTimeout(timeoutId);
      }

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

  // ── Update product ────────────────────────────────────────────────────────
  const updateProduct = async () => {
    if (!editingProduct)          { return; }
    if (!productForm.name.trim()) { alert("Please enter a product name."); return; }
    if (pricingType === 'fixed' && !productForm.price)  { alert("Please enter a price."); return; }
    if (pricingType === 'per_pound' && !pricePerPound)  { alert("Please enter a price per pound."); return; }

    setSaving(true);
    try {
      const session = await getValidSellerSession();
      if (!session?.access_token) return;

      const authHeaders = { ...getAuthHeaders(session.access_token), Prefer: "return=representation" };
      const stockQty = productForm.stock ? parseInt(productForm.stock) : null;

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
              name:           productForm.name.trim(),
              description:    productForm.description.trim() || null,
              price:          pricingType === 'per_pound' ? parseFloat(pricePerPound) : parseFloat(productForm.price),
              stock_quantity: stockQty,
              unit:           productForm.unit || null,
              category_id:    selectedCategoryId || null,
              images:         productImages.filter(img => img !== ''),
              status:         formStatus,
              pricing_type:   pricingType,
              price_per_pound: pricingType === 'per_pound' ? parseFloat(pricePerPound) || null : null,
              updated_at:     new Date().toISOString(),
            }),
          }
        );
      } finally {
        clearTimeout(timeoutId);
      }

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
      console.error("Update caught error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        alert("Update timed out. Please try again.");
      } else {
        alert("Error: " + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product ────────────────────────────────────────────────────────
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

  // ── Toggle active / draft ─────────────────────────────────────────────────
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

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const ds = getDisplayStatus(p);
    const matchTab    = tab === "All Products" || ds === tab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const isEditing = !!editingProduct;

  // ── Render ────────────────────────────────────────────────────────────────
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
            className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: '#053D2D' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add New Product
          </button>
        </div>

        {/* ── Add / Edit Product Form ── */}
        {showForm && (
          <div id="product-form" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <div className="space-y-1">

              {/* ── Basic Info ── */}
              <SectionLabel>Basic Info</SectionLabel>
              <div className="grid grid-cols-2 gap-4 mb-4">
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe your product..." className={inputCls + " resize-none"}
                  value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* ── Pricing ── */}
              <SectionLabel>Pricing</SectionLabel>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setPricingType('fixed')}
                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${pricingType === 'fixed' ? 'text-white' : 'border-gray-300 text-gray-600'}`}
                    style={pricingType === 'fixed' ? { borderColor: '#053D2D', backgroundColor: '#053D2D' } : {}}>
                    Fixed Price
                  </button>
                  <button type="button" onClick={() => setPricingType('per_pound')}
                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${pricingType === 'per_pound' ? 'text-white' : 'border-gray-300 text-gray-600'}`}
                    style={pricingType === 'per_pound' ? { borderColor: '#053D2D', backgroundColor: '#053D2D' } : {}}>
                    Price Per Pound
                  </button>
                </div>
              </div>

              {pricingType === 'fixed' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" placeholder="0.00" min="0" step="0.01" className={inputCls + " pl-7"}
                      value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                </div>
              )}

              {pricingType === 'per_pound' && (
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Per Pound</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
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
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    <p className="font-semibold mb-1">📦 Per Pound Product</p>
                    <p>Set your base price per pound here. Then go to the{' '}
                      <a href="/seller/dashboard/inventory" className="underline font-medium">Inventory</a> tab
                      {' '}to add individual cuts with exact weights and prices.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Inventory ── */}
              <SectionLabel>Inventory</SectionLabel>
              <div className="grid grid-cols-2 gap-4 mb-4">
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

              {/* ── Photos ── */}
              <SectionLabel>Photos</SectionLabel>
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-3">First image will be the main product photo (up to 4)</p>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div
                        className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center relative"
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

              {/* ── Status (edit mode only) ── */}
              {isEditing && (
                <>
                  <SectionLabel>Status</SectionLabel>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Product Status:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormStatus('active')}
                        className="px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors"
                        style={{
                          borderColor: formStatus === 'active' ? '#053D2D' : '#e5e7eb',
                          backgroundColor: formStatus === 'active' ? '#f0fdf4' : 'white',
                          color: formStatus === 'active' ? '#053D2D' : '#6b7280',
                        }}
                      >
                        ✓ Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus('draft')}
                        className="px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors"
                        style={{
                          borderColor: formStatus === 'draft' ? '#d97706' : '#e5e7eb',
                          backgroundColor: formStatus === 'draft' ? '#fefce8' : 'white',
                          color: formStatus === 'draft' ? '#d97706' : '#6b7280',
                        }}
                      >
                        Draft
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Action buttons ── */}
              <div className="flex gap-3 pt-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateProduct}
                      disabled={saving}
                      className="px-6 py-3 rounded-full text-white font-semibold disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                      style={{ backgroundColor: '#053D2D' }}
                    >
                      {saving && <Spinner />}
                      Update Product
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => saveProduct(false)}
                      disabled={saving}
                      className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Spinner />}
                      Save as Draft
                    </button>
                    <button
                      onClick={() => saveProduct(true)}
                      disabled={saving}
                      className="px-6 py-3 rounded-full text-white font-semibold disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                      style={{ backgroundColor: '#053D2D' }}
                    >
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
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg mr-1 transition-colors ${tab === t ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  style={tab === t ? { backgroundColor: '#053D2D' } : {}}>
                  {t}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition w-52"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/>
              </svg>
            </div>
          </div>

          {loadingPage ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#053D2D', borderTopColor: 'transparent' }} />
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
                    {["Image", "Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
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
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.categories?.name ?? "—"}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800 tabular-nums">
                          {p.pricing_type === 'per_pound'
                            ? `$${Number(p.price_per_pound ?? p.price).toFixed(2)}/lb`
                            : `$${Number(p.price).toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.stock_quantity ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ds]}`}>{ds}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors"
                              style={{ borderColor: '#053D2D', color: '#053D2D' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => toggleStatus(p)}
                              className="relative w-9 h-5 rounded-full transition-colors"
                              style={{ backgroundColor: p.status === "active" ? '#053D2D' : '#d1d5db' }}
                              aria-label="Toggle status"
                            >
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
