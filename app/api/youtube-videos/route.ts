import { NextResponse } from 'next/server';

const CHANNEL_ID = 'UCtoiAMFhqTeQ-uPN46BJo5Q';

export const revalidate = 3600;

interface Video {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

export async function GET() {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json({ videos: [] }, { status: 200 });
    }

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

    return NextResponse.json({ videos: videos.slice(0, 8) }, { status: 200 });
  } catch {
    return NextResponse.json({ videos: [] }, { status: 200 });
  }
}
