const { createClient } = require('@supabase/supabase-js')

const anonClient = createClient(
  'https://ezryfycxfmtffobyfjfa.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnose() {
  console.log('=== FULL PRODUCT DATA CHECK (anon key) ===\n')

  // Get full product data as the page would see it
  const { data: categories } = await anonClient
    .from('categories')
    .select('id, name, slug')

  for (const cat of (categories ?? [])) {
    const { data: products, error } = await anonClient
      .from('products')
      .select('id, name, description, price, images, seller_id')
      .eq('category_id', cat.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error || !products?.length) continue

    console.log(`\n[${cat.name}] — ${products.length} products:`)
    products.forEach(p => {
      console.log(`  - ${p.name}`)
      console.log(`    price: ${p.price} (type: ${typeof p.price})`)
      console.log(`    images: ${JSON.stringify(p.images)} (count: ${Array.isArray(p.images) ? p.images.length : 'not array'})`)
      console.log(`    description: ${p.description ? p.description.slice(0, 50) + '...' : 'NULL'}`)
      console.log(`    seller_id: ${p.seller_id}`)
    })
  }

  console.log('\n=== SUMMARY ===')
  const { data: all } = await anonClient
    .from('products')
    .select('id, name, status, category_id, images')
  console.log(`Total products visible to anon key: ${all?.length ?? 0}`)
  console.log(`Products with images: ${all?.filter(p => p.images && p.images.length > 0).length ?? 0}`)
  console.log(`Products with no images: ${all?.filter(p => !p.images || p.images.length === 0).length ?? 0}`)
}

diagnose().catch(err => console.error('Fatal:', err))
