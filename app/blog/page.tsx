import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { blogPosts } from './data';
import BlogGrid from './BlogGrid';

export const metadata = {
  title: 'Blog | Challengers Cricket Club',
  description:
    'News, sponsor spotlights, and player profiles from Challengers Cricket Club — London, Ontario.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
              <svg
                className="w-4 h-4 text-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <span className="text-sm text-gray-300">Stories &amp; Updates</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Our <span className="gradient-text">Blog</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              News, sponsor spotlights, and player profiles from Challengers Cricket Club
            </p>

            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
          </div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <BlogGrid posts={blogPosts} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
