import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta name="title" content="My Peta - Malaysia Data Visualization" />
        <meta name="description" content="Explore interactive data visualization for Malaysian states including population, income, crime, water consumption, and household expenditure. Get insights into state-level statistics across Malaysia." />
        <meta name="keywords" content="Malaysia, data visualization, statistics, population, income, crime, water consumption, household expenditure, Malaysian states, Peta Malaysia" />
        <meta name="author" content="My Peta" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mypeta.ai/" />
        <meta property="og:title" content="My Peta - Malaysia Data Visualization" />
        <meta property="og:description" content="Explore interactive data visualization for Malaysian states including population, income, crime, water consumption, and household expenditure." />
        <meta property="og:image" content="https://www.mypeta.ai/images/og-image.png" />
        <meta property="og:site_name" content="My Peta" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.mypeta.ai/" />
        <meta name="twitter:title" content="My Peta - Malaysia Data Visualization" />
        <meta name="twitter:description" content="Explore interactive data visualization for Malaysian states including population, income, crime, water consumption, and household expenditure." />
        <meta name="twitter:image" content="https://www.mypeta.ai/images/og-image.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Mobile Optimized */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#18181b" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="MY" />
        <meta name="geo.placename" content="Malaysia" />
        
        {/* Canonical URL */}
        <link rel="canonical" content="https://www.mypeta.ai/" />
      </Head>
      <body className="antialiased bg-zinc-100 dark:bg-zinc-950">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
