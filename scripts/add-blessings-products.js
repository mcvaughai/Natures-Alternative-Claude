// scripts/add-blessings-products.js
// Adds Blessings Ranch products directly via the Supabase service role key.
// Run with:
//   SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2) \
//     node scripts/add-blessings-products.js

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ezryfycxfmtffobyfjfa.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addProducts() {
  try {
    // ── 1. Find Blessings Ranch seller ───────────────────────────────────────
    // sellers table uses column 'slug', not 'store_slug'
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id')
      .eq('slug', 'blessings-ranch')
      .single()

    if (sellerError || !seller) {
      console.error('Could not find Blessings Ranch seller:', sellerError?.message ?? 'no row returned')
      return
    }
    console.log('Found Blessings Ranch seller ID:', seller.id)

    // ── 2. Fetch category IDs ─────────────────────────────────────────────────
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug')
      .in('slug', ['meat-poultry', 'dairy-eggs'])

    if (catError || !categories) {
      console.error('Could not fetch categories:', catError?.message)
      return
    }

    const meatCategory  = categories.find(c => c.slug === 'meat-poultry')
    const dairyCategory = categories.find(c => c.slug === 'dairy-eggs')

    console.log('Meat category  ID:', meatCategory?.id)
    console.log('Dairy category ID:', dairyCategory?.id)

    if (!meatCategory || !dairyCategory) {
      console.error('One or more categories not found. Make sure the seed data has been run.')
      return
    }

    // ── 3. Define products ────────────────────────────────────────────────────
    // Column names match the actual schema:
    //   stock_qty  (not stock_quantity)
    //   status     'active' | 'draft'  (not is_active boolean)
    //   featured   boolean             (not is_featured)
    //   unit       text
    // No fulfillment_pickup / fulfillment_delivery columns on products table.
    const products = [
      {
        seller_id:   seller.id,
        name:        'Farm Fresh Eggs',
        slug:        'farm-fresh-eggs',
        description: 'Fresh farm eggs from our free range pasture raised chickens and ducks. Nutritious, delicious and farm fresh from Blessings Ranch in Houston TX.',
        price:       8.00,
        stock_qty:   100,
        category_id: dairyCategory.id,
        status:      'active',
        featured:    true,
        unit:        'dozen',
      },
      {
        seller_id:   seller.id,
        name:        'Raw Dairy',
        slug:        'raw-dairy',
        description: 'Rich creamy raw dairy products freshly sourced from Stryk Jersey Farm. Experience the taste of authentic natural dairy straight from the farm.',
        price:       10.00,
        stock_qty:   30,
        category_id: dairyCategory.id,
        status:      'active',
        featured:    true,
        unit:        'gallon',
      },
      {
        seller_id:   seller.id,
        name:        'Grass-Fed Ribeye Steak',
        slug:        'grass-fed-ribeye-steak',
        description: 'Premium grass-fed ribeye steak raised right here on Blessings Ranch. Our cattle are raised in open pastures ensuring a natural stress-free life and rich flavorful beef.',
        price:       28.00,
        stock_qty:   40,
        category_id: meatCategory.id,
        status:      'active',
        featured:    true,
        unit:        'lb',
      },
      {
        seller_id:   seller.id,
        name:        'Pasture Raised Chicken Breast',
        slug:        'pasture-raised-chicken-breast',
        description: 'Tender juicy chicken breast from our pasture raised chickens that roam freely on Blessings Ranch. Experience the difference of truly free range chicken.',
        price:       14.00,
        stock_qty:   60,
        category_id: meatCategory.id,
        status:      'active',
        featured:    true,
        unit:        'lb',
      },
      {
        seller_id:   seller.id,
        name:        'Pasture Raised Bacon',
        slug:        'pasture-raised-bacon',
        description: 'Delicious thick cut bacon from our pasture raised heritage pigs at Blessings Ranch. No added hormones or antibiotics. Just pure natural bacon the way it should be.',
        price:       16.00,
        stock_qty:   50,
        category_id: meatCategory.id,
        status:      'active',
        featured:    true,
        unit:        'lb',
      },
    ]

    // ── 4. Insert products ────────────────────────────────────────────────────
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (insertError) {
      console.error('Error inserting products:', insertError.message)
      if (insertError.message.includes('unique') || insertError.code === '23505') {
        console.error('Hint: Some slugs may already exist for this seller. Delete existing rows first or change the slugs.')
      }
      return
    }

    console.log('\nSuccessfully added', insertedProducts.length, 'products!')
    insertedProducts.forEach(p => {
      console.log(`  ✅ ${p.name} — $${p.price} — ID: ${p.id}`)
    })

    // ── 5. Verify by re-querying ──────────────────────────────────────────────
    console.log('\n── Verification query ──────────────────────────────────────────')
    const { data: verify } = await supabase
      .from('products')
      .select('name, price, stock_qty, status')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: true })

    if (verify) {
      console.log(`${verify.length} total products for Blessings Ranch:`)
      verify.forEach(p => {
        console.log(`  • ${p.name.padEnd(35)} $${String(p.price).padEnd(6)} stock: ${p.stock_qty}  [${p.status}]`)
      })
    }

  } catch (err) {
    console.error('Unexpected error:', err.message ?? err)
  }
}

addProducts()
