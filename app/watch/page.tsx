import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CHANNEL_ID = 'UCtoiAMFhqTeQ-uPN46BJo5Q';
const CHANNEL_HANDLE = 'Challengersccldn';
const LIVE_EMBED_URL = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`;
const SUBSCRIBE_URL = `https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`;
const CHANNEL_URL = `https://www.youtube.com/@${CHANNEL_HANDLE}`;

export const revalidate = 3600;

export const metadata = {
  title: 'Watch Live — Challengers Cricket Club',
  description: 'Watch Challengers CC matches live on YouTube. Match livestreams, highlights, and player spotlights from London, Ontario.',
};

interface Video {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

async function getLatestVideos(): Promise<Video[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });

    if (!res.ok) return [];

    const xml = await res.text();
    const videos: Video[] = [];

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const videoIdRegex = /<yt:videoId>([^<]+)<\/yt:videoId>/;
    const titleRegex = /<title>([^<]+)<\/title>/;
    const publishedRegex = /<published>([^<]+)<\/published>/;

    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const videoId = videoIdRegex.exec(entry)?.[1];
      const title = titleRegex.exec(entry)?.[1];
      const published = publishedRegex.exec(entry)?.[1];

      if (videoId && title && published) {
        videos.push({
          id: videoId,
          title,
          published,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
      }
    }

    return videos.slice(0, 8);
  } catch {
    return [];
  }
}

export default async function WatchPage() {
  const videos = await getLatestVideos();

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero + Live Embed */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-red-400">Match Day Live Stream</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Watch <span className="gradient-text">Live</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Tune in to Challengers CC matches live. When we&apos;re streaming, the match appears
              below. Otherwise, catch up on past matches and highlights from our archive.
            </p>
          </div>

          {/* Live Stream Embed */}
          <div className="glass rounded-2xl p-4 md:p-6 border-2 border-red-500/30">
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={LIVE_EMBED_URL}
                title="Challengers CC Live Stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 px-2">
              <p className="text-sm text-gray-400">
                If nothing is playing, no match is currently live. Subscribe to get notified the
                moment we go live on match days.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Subscribe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Videos / Empty State */}
      {videos.length > 0 ? (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Latest <span className="gradient-text">Videos</span>
                </h2>
                <p className="text-gray-400">Match archives, highlights, and more</p>
              </div>
              <a
                href={`${CHANNEL_URL}/videos`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                View all on YouTube
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl overflow-hidden group hover:border-red-500/50 border border-white/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="aspect-video bg-black relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2 text-sm">{video.title}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(video.published).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass rounded-2xl p-12 border border-white/10">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Content <span className="gradient-text">Coming Soon</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Our channel just launched. Match livestreams, highlights, player spotlights, and
                coaching tips will all appear here as the 2026 season gets underway.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Subscribe to get notified
              </a>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
