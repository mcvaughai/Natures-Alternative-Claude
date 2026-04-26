"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { supabase } from "@/lib/supabase";

const FILTER_TABS = ["All Products", "Active", "Draft", "Out of Stock"] as const;
type FilterTab = typeof FILTER_TABS[number];

interface Category { id: string; name: string; }

interface DbProduct {
  id: string;
  name: string;
  price: number;
  stock_qty: number | null;
  in_stock: boolean;
  status: string;
  images: string[];
  categories: { name: string } | null;
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
  const [tab, setTab]           = useState<FilterTab>("All Products");
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving]     = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);

  // Form state
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedImageFile, setSelectedImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview]             = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch products for this seller ─────────────────────────────────────────
  const fetchProducts = useCallback(async (sid: string) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock_qty, in_stock, status, images, categories (name)")
      .eq("seller_id", sid)
      .order("created_at", { ascending: false });
    if (data) setProducts(data as unknown as DbProduct[]);
  }, []);

  // ── Init: get seller ID, categories, products ───────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingPage(false); return; }

      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!seller) { setLoadingPage(false); return; }
      setSellerId(seller.id);

      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .order("sort_order");
      if (cats) setCategories(cats);

      await fetchProducts(seller.id);
      setLoadingPage(false);
    }
    init();
  }, [fetchProducts]);

  // ── Upload image to Supabase Storage ───────────────────────────────────────
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // ── Handle file selection & preview ────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setProductForm({ name: "", description: "", price: "", stock: "" });
    setSelectedCategoryId("");
    clearImage();
  };

  // ── Save product (publish or draft) ────────────────────────────────────────
  const saveProduct = async (isActive: boolean) => {
    if (!sellerId)             { alert("Seller profile not found. Please log in again."); return; }
    if (!productForm.name.trim()) { alert("Please enter a product name."); return; }
    if (!productForm.price)    { alert("Please enter a price."); return; }

    setSaving(true);
    try {
      // Upload image first if one was selected
      let imageUrl: string | null = null;
      if (selectedImageFile) {
        imageUrl = await uploadImage(selectedImageFile);
      }

      // Generate a unique slug
      const slug =
        productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
        "-" + Date.now().toString(36);

      const { error } = await supabase.from("products").insert({
        seller_id:   sellerId,
        name:        productForm.name.trim(),
        slug,
        description: productForm.description.trim() || null,
        price:       parseFloat(productForm.price),
        stock_qty:   productForm.stock ? parseInt(productForm.stock) : null,
        in_stock:    productForm.stock ? parseInt(productForm.stock) > 0 : true,
        category_id: selectedCategoryId || null,
        images:      imageUrl ? [imageUrl] : [],
        status:      isActive ? "active" : "draft",
      });

      if (error) { alert("Error saving product: " + error.message); return; }

      alert(isActive ? "Product published successfully!" : "Product saved as draft!");
      resetForm();
      setShowForm(false);
      await fetchProducts(sellerId);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product ──────────────────────────────────────────────────────────
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Toggle active / draft ───────────────────────────────────────────────────
  const toggleStatus = async (p: DbProduct) => {
    const newStatus = p.status === "active" ? "draft" : "active";
    await supabase.from("products").update({ status: newStatus }).eq("id", p.id);
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const ds = getDisplayStatus(p);
    const matchTab    = tab === "All Products" || ds === tab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SellerLayout>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <button onClick={() => { setShowForm(v => !v); resetForm(); }}
            className="flex items-center gap-1.5 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add New Product
          </button>
        </div>

        {/* ── Add Product Form ── */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Add New Product</h2>
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

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" placeholder="0.00" min="0" step="0.01" className={inputCls + " pl-7"}
                      value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                  <input type="number" placeholder="0" min="0" className={inputCls}
                    value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe your product..." className={inputCls + " resize-none"}
                  value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#1a4a2e]/50 hover:bg-[#1a4a2e]/5 transition-colors">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mb-2" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span className="text-sm text-gray-500">Click to upload product image</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG, WEBP</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden" onChange={handleImageSelect} />
                </label>
                {imagePreview && (
                  <button type="button" onClick={clearImage}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium">
                    Remove image
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
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
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
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
                            <button className="text-xs font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors">Edit</button>
                            <button onClick={() => deleteProduct(p.id)}
                              className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                            <button onClick={() => toggleStatus(p)}
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
