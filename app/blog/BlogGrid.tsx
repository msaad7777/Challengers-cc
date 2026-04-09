"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BlogPost, categories } from './data';

const categoryColors: Record<string, string> = {
  'Sponsor Spotlight': 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  'Player Profile': 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  'Club News': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered =
    activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/50 shadow-lg shadow-primary-500/10'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No posts in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass rounded-2xl overflow-hidden glass-hover group transition-all duration-300 flex flex-col"
            >
              {/* Card Header with Category */}
              <div className="p-8 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full border ${
                      categoryColors[post.category] || 'bg-white/10 text-gray-300 border-white/20'
                    }`}
                  >
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 pt-2 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {new Date(post.date).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
