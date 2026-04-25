import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  unit: string;
  weight: string | null;
  images: string[];
  tags: string[];
  certifications: string[];
  in_stock: boolean;
  stock_qty: number | null;
  featured: boolean;
  rating: number;
  review_count: number;
  status: string;
  created_at: string;
  sellers?: Seller;
}

export interface Seller {
  id: string;
  user_id: string | null;
  slug: string;
  farm_name: string;
  owner_name: string | null;
  email: string;
  phone: string | null;
  description: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  logo_url: string | null;
  banner_url: string | null;
  fulfillment: string[];
  certifications: string[];
  product_types: string[];
  rating: number;
  review_count: number;
  product_count: number;
  status: string;
  featured: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: Record<string, string> | null;
  payment_method: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  verified: boolean;
  created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts({
  category,
  subcategory,
  search,
  featured,
  limit = 24,
  offset = 0,
}: {
  category?: string;
  subcategory?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  let query = supabase
    .from("products")
    .select("*, sellers(farm_name, slug, logo_url, rating)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (subcategory) {
    const { data: sub } = await supabase.from("subcategories").select("id").eq("slug", subcategory).single();
    if (sub) query = query.eq("subcategory_id", sub.id);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, sellers(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Product;
}

// ─── Sellers ──────────────────────────────────────────────────────────────────

export async function getSellers({
  featured,
  limit = 20,
  offset = 0,
}: { featured?: boolean; limit?: number; offset?: number } = {}) {
  let query = supabase
    .from("sellers")
    .select("*")
    .eq("status", "approved")
    .order("rating", { ascending: false })
    .range(offset, offset + limit - 1);

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Seller[];
}

export async function getSellerBySlug(slug: string) {
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();
  if (error) throw error;
  return data as Seller;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as Category[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(orderData: {
  user_id: string;
  items: { product_id: string; seller_id: string; name: string; image?: string; price: number; quantity: number }[];
  shipping_address: Record<string, string>;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_method?: string;
}) {
  const { items, ...order } = orderData;

  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({ ...order, payment_status: "pending" })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: newOrder.id,
    product_id: item.product_id,
    seller_id: item.seller_id,
    name: item.name,
    image: item.image ?? null,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;

  return newOrder as Order;
}

export async function getOrdersByCustomer(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getOrdersBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, orders(order_number, status, created_at, shipping_address)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviewsByProduct(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(first_name, last_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Review[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*, products(*, sellers(farm_name, slug))")
    .eq("user_id", userId);
  if (error) throw error;
  return data as CartItem[];
}

export async function addToCart(userId: string, productId: string, quantity = 1) {
  const { data, error } = await supabase
    .from("cart_items")
    .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: "user_id,product_id" })
    .select()
    .single();
  if (error) throw error;
  return data as CartItem;
}

export async function removeFromCart(userId: string, productId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*, products(*, sellers(farm_name, slug))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as WishlistItem[];
}

export async function toggleWishlist(userId: string, productId: string) {
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) throw error;
    return false; // removed
  } else {
    const { error } = await supabase
      .from("wishlist_items")
      .insert({ user_id: userId, product_id: productId });
    if (error) throw error;
    return true; // added
  }
}

// ─── Seller Applications ──────────────────────────────────────────────────────

export async function submitSellerApplication(data: {
  user_id?: string;
  farm_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  description?: string;
  product_types?: string[];
  fulfillment?: string[];
  certifications?: string[];
  website?: string;
  instagram?: string;
  years_farming?: string;
  additional_info?: string;
}) {
  const { data: result, error } = await supabase
    .from("seller_applications")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
  if (error) throw error;
}
