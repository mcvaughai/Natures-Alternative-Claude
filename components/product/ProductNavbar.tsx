'use client'

import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import StoreNavbar from '@/components/store/StoreNavbar'

/**
 * Navbar wrapper used only on /product/[id].
 *
 * When the page is reached via a farm store link (?store=<slug>):
 *   - Main marketplace Navbar is NON-sticky (scrolls away with the page)
 *   - Farm StoreNavbar is sticky at top-0 (stays pinned as user scrolls)
 *
 * When reached from the main marketplace (no ?store param):
 *   - Normal sticky marketplace Navbar behaviour
 *   - No StoreNavbar shown
 */
export default function ProductNavbar() {
  const searchParams = useSearchParams()
  const fromStore = searchParams.get('store') // store slug or null

  return (
    <>
      <Navbar nonSticky={!!fromStore} />
      {fromStore && (
        <StoreNavbar storeId={fromStore} activePage="shop" />
      )}
    </>
  )
}
