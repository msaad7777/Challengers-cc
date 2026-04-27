"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BlogPost, categories } from './data';

const categoryColors: Record<string, string> = {
  'Sponsor Spotlight': 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  'Player Profile': 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  'Club News': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Match Reports': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const categoryIcons: Record<string, string> = {
  'Sponsor Spotlight': '🤝',
  'Player Profile': '🏏',
  'Club News': '📢',
  'Match Reports': '📋',
};

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered =
    activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const featuredPost = filtered.find((p) => p.featured);
  const remainingPosts = filtered.filter((p) => p !== featuredPost);

  return (
    <>
      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
        {categories.map((cat) => {
          const count = cat === 'All' ? posts.length : posts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`glass rounded-xl p-4 text-center transition-all duration-300 border-2 ${
                activeCategory === cat
                  ? 'border-primary-500/50 shadow-lg shadow-primary-500/10'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-1">
                {cat === 'All' ? '📋' : categoryIcons[cat]}
              </div>
              <div className={`text-xs font-medium ${activeCategory === cat ? 'text-primary-400' : 'text-gray-400'}`}>
                {cat}
              </div>
              <div className="text-lg font-bold text-white mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No posts in this category yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured Post - Large Card */}
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block glass rounded-2xl overflow-hidden glass-hover group transition-all duration-300 mb-10 border border-white/10 hover:border-primary-500/30"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left - Image or Gradient */}
                <div className="relative h-48 md:h-auto md:min-h-[280px] bg-gradient-to-br from-primary-900/40 via-gray-900 to-accent-900/30 flex items-center justify-center overflow-hidden">
                  {featuredPost.image ? (
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : featuredPost.video ? (
                    <div className="text-center p-8">
                      <div className="text-6xl mb-3">▶️</div>
                      <p className="text-gray-400 text-sm">Watch video inside</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="text-6xl mb-3">{categoryIcons[featuredPost.category] || '📄'}</div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-500 text-white shadow-lg">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Right - Content */}
                <div className="p-8 flex flex-col justify-center">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full border w-fit mb-4 ${
                      categoryColors[featuredPost.category] || 'bg-white/10 text-gray-300 border-white/20'
                    }`}
                  >
                    {featuredPost.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(featuredPost.date).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Remaining Posts Grid */}
          {remainingPosts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="glass rounded-2xl overflow-hidden glass-hover group transition-all duration-300 flex flex-col border border-white/5 hover:border-primary-500/30"
                >
                  {/* Card Image / Icon */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-900 via-gray-800/50 to-gray-900 flex items-center justify-center overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : post.video ? (
                      <div className="text-center">
                        <div className="text-4xl mb-1">▶️</div>
                        <p className="text-gray-500 text-xs">Video</p>
                      </div>
                    ) : (
                      <div className="text-5xl">{categoryIcons[post.category] || '📄'}</div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                          categoryColors[post.category] || 'bg-white/10 text-gray-300 border-white/20'
                        }`}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-xs text-gray-500">
                        {new Date(post.date).toLocaleDateString('en-CA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-primary-400 text-xs font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}
    </>
  );
}
