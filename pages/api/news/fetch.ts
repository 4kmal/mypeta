import type { NextApiRequest, NextApiResponse } from 'next';
import { parseStringPromise } from 'xml2js';

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
  if (item['media:content']?.[0]?.$?.url) {
    return item['media:content'][0].$.url;
  }
  if (item['media:thumbnail']?.[0]?.$?.url) {
    return item['media:thumbnail'][0].$.url;
  }
  if (item.enclosure?.[0]?.$?.url) {
    return item.enclosure[0].$.url;
  }
  
  // Try to extract from description HTML
  const description = item.description?.[0] || item['content:encoded']?.[0] || '';
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
    const result = await parseStringPromise(xml);
    
    // Handle different RSS formats
    const items = result.rss?.channel?.[0]?.item || result.feed?.entry || [];
    
    return items.slice(0, 10).map((item: any) => {
      // Handle both RSS 2.0 and Atom formats
      const title = item.title?.[0]?._ || item.title?.[0] || '';
      const description = 
        item.description?.[0] || 
        item.summary?.[0]?._ || 
        item.summary?.[0] || 
        item['content:encoded']?.[0] || 
        '';
      
      // Clean HTML from description
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
        .substring(0, 200) + (description.length > 200 ? '...' : '');
      
      const link = item.link?.[0]?._ || item.link?.[0] || item.id?.[0] || '';
      const pubDate = item.pubDate?.[0] || item.published?.[0] || item.updated?.[0] || new Date().toISOString();
      const imageUrl = extractImageUrl(item);
      const category = item.category?.[0]?._ || item.category?.[0] || undefined;
      
      return {
        title: typeof title === 'string' ? title : title?._ || 'No title',
        description: cleanDescription,
        link: typeof link === 'string' ? link : link?.href || '#',
        pubDate,
        source,
        imageUrl,
        category,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsResponse>
) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, news: [], error: 'Method not allowed' });
  }

  const { sources } = req.query;
  const selectedSources = sources 
    ? (typeof sources === 'string' ? sources.split(',') : sources)
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
    return res.status(200).json({
      success: true,
      news: allNews.slice(0, 50),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    return res.status(500).json({
      success: false,
      news: [],
      error: errorMessage,
    });
  }
}

