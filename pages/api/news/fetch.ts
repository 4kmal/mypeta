
import { XMLParser } from 'fast-xml-parser';

export const runtime = 'edge';

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  category?: string;
}

export interface NewsResponse {
  success: boolean;
  news: NewsItem[];
  error?: string;
}

// Popular Malaysian and international news RSS feeds
const RSS_FEEDS = {
  malaysiakini: 'https://www.malaysiakini.com/rss/en/news.rss',
  thestar: 'https://www.thestar.com.my/rss/news/nation/',
  bernama: 'https://www.bernama.com/en/rss/news_malaysia.php',
  nst: 'https://www.nst.com.my/rss',
  malay_mail: 'https://www.malaymail.com/feed/malaysia',

  // International
  bbc: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  reuters: 'https://www.reutersagency.com/feed/',
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
};

/**
 * Extract image URL from RSS item
 */
function extractImageUrl(item: any): string | undefined {
  // Try different possible image locations
  // fast-xml-parser handles attributes differently (often prefixed or in a separate property depending on config)
  // With ignoreAttributes: false, attributes are usually available directly or via a prefix

  if (item['media:content'] && item['media:content']['@_url']) {
    return item['media:content']['@_url'];
  }
  if (Array.isArray(item['media:content']) && item['media:content'][0] && item['media:content'][0]['@_url']) {
    return item['media:content'][0]['@_url'];
  }

  if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) {
    return item['media:thumbnail']['@_url'];
  }

  if (item.enclosure && item.enclosure['@_url']) {
    return item.enclosure['@_url'];
  }

  // Try to extract from description HTML
  const description = item.description || item['content:encoded'] || '';
  const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Parse RSS feed XML
 */
async function parseRSSFeed(xml: string, source: string): Promise<NewsItem[]> {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(xml);

    // Handle different RSS formats
    let items = [];
    if (result.rss && result.rss.channel && result.rss.channel.item) {
      items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item];
    } else if (result.feed && result.feed.entry) {
      items = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
    }

    return items.slice(0, 10).map((item: any) => {
      // Handle both RSS 2.0 and Atom formats
      const title = item.title || '';
      const description =
        item.description ||
        item.summary ||
        item['content:encoded'] ||
        '';

      // Clean HTML from description
      const cleanDescription = typeof description === 'string' ? description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
        .substring(0, 200) + (description.length > 200 ? '...' : '') : '';

      const link = item.link || item.id || '';
      // Handle Atom link object/array
      const finalLink = typeof link === 'string' ? link : (link['@_href'] || (Array.isArray(link) ? link[0]['@_href'] : '#'));

      const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();
      const imageUrl = extractImageUrl(item);
      const category = item.category || undefined;

      return {
        title: typeof title === 'string' ? title : 'No title',
        description: cleanDescription,
        link: finalLink,
        pubDate,
        source,
        imageUrl,
        category: typeof category === 'string' ? category : undefined,
      };
    }).filter((item: NewsItem) => item.title && item.link); // Filter out invalid items
  } catch (error) {
    console.error(`Error parsing RSS feed from ${source}:`, error);
    return [];
  }
}

/**
 * Fetch RSS feed with timeout
 */
async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MyPeta/1.0; +https://mypeta.vercel.app)',
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export default async function handler(req: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, news: [], error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  const url = new URL(req.url);
  const sourcesParam = url.searchParams.get('sources');
  const selectedSources = sourcesParam
    ? sourcesParam.split(',')
    : ['thestar', 'bernama', 'bbc'];

  try {
    const feedPromises = selectedSources
      .filter(source => RSS_FEEDS[source as keyof typeof RSS_FEEDS])
      .map(async (source) => {
        try {
          const url = RSS_FEEDS[source as keyof typeof RSS_FEEDS];
          const response = await fetchWithTimeout(url, 8000);

          if (!response.ok) {
            console.error(`Failed to fetch ${source}: ${response.status}`);
            return [];
          }

          const xml = await response.text();
          return await parseRSSFeed(xml, source);
        } catch (error) {
          console.error(`Error fetching ${source}:`, error);
          return [];
        }
      });

    const newsArrays = await Promise.all(feedPromises);
    const allNews = newsArrays.flat();

    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Return top 50 articles
    return new Response(
      JSON.stringify({
        success: true,
        news: allNews.slice(0, 50),
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    return new Response(
      JSON.stringify({
        success: false,
        news: [],
        error: errorMessage,
      }),
      { status: 500, headers }
    );
  }
}
