// ─── Farm ────────────────────────────────────────────────────────────────────

export interface Farm {
  id: string
  name: string
  slug: string
  description: string
  location: {
    city: string
    state: string
    zip: string
  }
  ownerId: string
  imageUrl?: string
  certifications?: string[]
  createdAt: string
  updatedAt: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  farmId: string
  name: string
  slug: string
  description: string
  price: number
  unit: string
  stock: number
  category: ProductCategory
  imageUrl?: string
  available: boolean
  createdAt: string
  updatedAt: string
}

export type ProductCategory =
  | "vegetables"
  | "fruits"
  | "dairy"
  | "eggs"
  | "meat"
  | "honey"
  | "herbs"
  | "grains"
  | "other"

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export type UserRole = "consumer" | "farmer" | "admin"

// ─── Order ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string
  userId: string
  farmId: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  quantity: number
  priceAtPurchase: number
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "delivered"
  | "cancelled"
