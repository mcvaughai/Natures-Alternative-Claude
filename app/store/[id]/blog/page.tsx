import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreNavbar from "@/components/store/StoreNavbar";
import Link from "next/link";

interface StoreBlogPageProps {
  params: { id: string };
}

const FEATURED_POST = {
  id: "1",
  title: "A Day in the Life on Our Farm",
  date: "December 12, 2024",
  excerpt:
    "Ever wonder what it looks like behind the scenes on a natural farm? We walk you through a typical Tuesday — from the 5am morning rounds with the animals to the afternoon harvest and the evening prep for the next day's pickup orders.",
  readTime: "5 min read",
};

const BLOG_POSTS = [
  {
    id: "2",
    title: "Why We Chose Regenerative Farming",
    date: "November 28, 2024",
    excerpt: "Regenerative farming is more than a trend — it is a commitment to healing the land for future generations. Here is why we made the switch and what we have learned.",
    readTime: "4 min read",
  },
  {
    id: "3",
    title: "The Secret to Our Heirloom Tomatoes",
    date: "November 15, 2024",
    excerpt: "Our heirloom tomatoes consistently sell out within hours of listing. We are sharing the full story behind our growing methods, seed selection, and soil regimen.",
    readTime: "3 min read",
  },
  {
    id: "4",
    title: "Meet the Animals — Winter Update",
    date: "November 2, 2024",
    excerpt: "The herd is growing and the animals are thriving heading into winter. We introduce you to some of our newest additions and share how we prepare our pastures for the cooler months.",
    readTime: "6 min read",
  },
  {
    id: "5",
    title: "Seasonal Eating Guide: December Picks",
    date: "October 22, 2024",
    excerpt: "What is in season at our farm this December? We break down our top picks, how to store them, and a few of our favorite recipes for each.",
    readTime: "4 min read",
  },
  {
    id: "6",
    title: "Behind the Scenes: Our Fulfillment Process",
    date: "October 10, 2024",
    excerpt: "From harvest to your doorstep — we walk through exactly how we pick, pack and deliver your orders to ensure everything arrives fresh and intact.",
    readTime: "3 min read",
  },
  {
    id: "7",
    title: "Soil Health: The Foundation of Natural Farming",
    date: "September 28, 2024",
    excerpt: "Healthy soil is the foundation of everything we do. We share the testing, composting, and cover cropping practices that keep our soil alive and productive year after year.",
    readTime: "5 min read",
  },
];

export default function StoreBlogPage({ params }: StoreBlogPageProps) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <StoreNavbar storeId={id} />
      <main className="flex-1">

        {/* ── Blog Header ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Example Farms Blog</h1>
            <p className="text-gray-500">Stories from the farm</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* ── Featured Post ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-200 h-56 sm:h-72 flex items-center justify-center text-gray-400 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="absolute top-4 left-4">
                <span className="bg-[#1a4a2e] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Featured
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>{FEATURED_POST.date}</span>
                <span>·</span>
                <span>{FEATURED_POST.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{FEATURED_POST.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-5">{FEATURED_POST.excerpt}</p>
              <Link
                href={`/store/${id}/blog/${FEATURED_POST.id}`}
                className="inline-block bg-[#1a4a2e] hover:bg-[#143d24] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>

          {/* ── Blog Grid ─────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">More from the Farm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BLOG_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    <Link
                      href={`/store/${id}/blog/${post.id}`}
                      className="text-[#1a4a2e] hover:text-[#143d24] font-semibold text-sm flex items-center gap-1 group"
                    >
                      Read More
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Load More ─────────────────────────────────────────── */}
          <div className="text-center pt-2">
            <button className="border-2 border-[#1a4a2e] text-[#1a4a2e] hover:bg-[#1a4a2e] hover:text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm">
              Load More Posts
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
