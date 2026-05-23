'use client'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: any[]
  storeSlug?: string
  onAddToCart?: (product: any) => void
  emptyMessage?: string
  emptySubMessage?: string
}

export default function ProductGrid({
  products,
  storeSlug,
  onAddToCart,
  emptyMessage = 'No products found',
  emptySubMessage = 'Check back soon as more farms join!'
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm w-full">
        <p className="text-4xl mb-4">🌿</p>
        <h3 className="text-xl font-bold text-gray-700">{emptyMessage}</h3>
        <p className="text-gray-400 mt-2 text-sm">{emptySubMessage}</p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        width: '100%'
      }}
    >
      {products.map((product: any) => (
        <ProductCard
          key={product.id}
          product={product}
          storeSlug={storeSlug}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
