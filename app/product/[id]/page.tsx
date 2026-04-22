import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetail from "@/components/product/ProductDetail";
import SimilarItems from "@/components/product/SimilarItems";
import ReviewsSection from "@/components/product/ReviewsSection";
import SimilarStores from "@/components/product/SimilarStores";

interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1 pb-8">
        <ProductDetail productId={params.id} />
        <SimilarItems />
        <ReviewsSection />
        <SimilarStores />
      </main>
      <Footer />
    </div>
  );
}
