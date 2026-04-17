import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/marketplace/HeroBanner";
import AllProductsGrid from "@/components/explore/AllProductsGrid";
import TopRated from "@/components/explore/TopRated";
import AdBanner from "@/components/explore/AdBanner";
import MoreResults from "@/components/explore/MoreResults";
import Pagination from "@/components/explore/Pagination";

interface ExplorePageProps {
  searchParams: { category?: string };
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  const category = searchParams.category || "all";

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />
        <AllProductsGrid category={category} />
        <TopRated />
        <AdBanner />
        <MoreResults />
        <Pagination totalPages={5} />
      </main>
      <Footer />
    </div>
  );
}
