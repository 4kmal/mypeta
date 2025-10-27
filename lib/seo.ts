export const SEO_CONFIG = {
  title: "My Peta - Malaysia Data Visualization",
  description: "Explore interactive data visualization for Malaysian states including population, income, crime, water consumption, and household expenditure. Get insights into state-level statistics across Malaysia.",
  keywords: "Malaysia, data visualization, statistics, population, income, crime, water consumption, household expenditure, Malaysian states, Peta Malaysia",
  url: "https://petamalaysia.com/",
  ogImage: "/images/og-image.png",
  author: "My Peta",
  locale: "en_US",
  siteName: "My Peta",
  twitterHandle: "@mypeta",
} as const;

export const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  url: SEO_CONFIG.url,
  applicationCategory: "Data Visualization",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "MYR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    ratingCount: "1",
  },
  publisher: {
    "@type": "Organization",
    name: SEO_CONFIG.author,
  },
};

