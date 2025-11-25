import Head from 'next/head';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, TrendingUp, Newspaper, Globe, Database, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import globeAnimationData from '@/public/lottie/globe.json';

const About = () => {
  // Translations
  const title = useTranslation({ en: 'About My Peta', ms: 'Tentang My Peta' });
  const subtitle = useTranslation({ 
    en: 'Making Malaysian data accessible, engaging, and understandable for everyone.', 
    ms: 'Menjadikan data Malaysia mudah diakses, menarik, dan difahami oleh semua.' 
  });

  const missionTitle = useTranslation({ en: 'Our Mission', ms: 'Misi Kami' });
  const missionText = useTranslation({
    en: 'My Peta (Map of Malaysia) is an initiative to democratize data access. We believe that data should not just be numbers on a spreadsheet but a story that everyone can understand. By visualizing complex statistics from the Department of Statistics Malaysia (DOSM) and other sources, we empower Malaysians to make informed decisions and better understand their country.',
    ms: 'My Peta adalah inisiatif untuk mendemokrasikan akses data. Kami percaya data bukan sekadar nombor di hamparan tetapi satu cerita yang boleh difahami semua. Dengan memvisualisasikan statistik kompleks dari Jabatan Perangkaan Malaysia (DOSM) dan sumber lain, kami memperkasakan rakyat Malaysia untuk membuat keputusan termaklum dan lebih memahami negara mereka.'
  });

  const whatWeOfferTitle = useTranslation({ en: 'What We Offer', ms: 'Apa Yang Kami Tawarkan' });
  
  const features = [
    {
      title: useTranslation({ en: 'Interactive Data', ms: 'Data Interaktif' }),
      description: useTranslation({ 
        en: 'Explore state-level statistics including income, population, crime, and more through intuitive maps and charts.', 
        ms: 'Terokai statistik peringkat negeri termasuk pendapatan, populasi, jenayah, dan banyak lagi melalui peta dan carta intuitif.' 
      }),
      icon: <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: useTranslation({ en: 'Public Polls', ms: 'Undian Awam' }),
      description: useTranslation({ 
        en: 'Participate in community polls on trending topics. Your voice matters in shaping the Malaysian narrative.', 
        ms: 'Sertai undian komuniti mengenai topik trending. Suara anda penting dalam membentuk naratif Malaysia.' 
      }),
      icon: <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: useTranslation({ en: 'Latest News', ms: 'Berita Terkini' }),
      description: useTranslation({ 
        en: 'Stay updated with aggregated news relevant to Malaysia, filtered for clarity and relevance.', 
        ms: 'Kekal kemaskini dengan berita terkumpul yang relevan untuk Malaysia, ditapis untuk kejelasan dan relevansi.' 
      }),
      icon: <Newspaper className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  const transparencyTitle = useTranslation({ en: 'Transparency & Data', ms: 'Ketelusan & Data' });
  const transparencyText = useTranslation({
    en: 'We use official open data provided by the Malaysian government via OpenDOSM. While we strive for accuracy, My Peta is an independent platform and not affiliated with the government.',
    ms: 'Kami menggunakan data terbuka rasmi yang disediakan oleh kerajaan Malaysia melalui OpenDOSM. Walaupun kami berusaha untuk ketepatan, My Peta adalah platform bebas dan tidak berafiliasi dengan kerajaan.'
  });

  return (
    <>
      <Head>
        <title>{title} - My Peta</title>
        <meta name="description" content="Learn about My Peta, an initiative to visualize Malaysian data and empower citizens through information." />
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-20 md:pb-12">
        <PageHeader showPollsButton={true} showNewsButton={true} showDataButton={true} />

        <main className="max-w-4xl mx-auto px-4 pt-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="max-w-xl mx-auto mb-6 relative">
              <img src="/images/map/map-white.png" alt="My Peta" className="w-full h-full object-contain opacity-20" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
              {title}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl hidden sm:block">
                <Globe className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-3">
                  {missionTitle}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {missionText}
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 text-center">
              {whatWeOfferTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 mb-12 text-center">
            <Database className="h-8 w-8 text-zinc-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-3">
              {transparencyTitle}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {transparencyText}
            </p>
            <div className="mt-6">
              <Link 
                href="https://data.gov.my/" 
                target="_blank"
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Visit data.gov.my
              </Link>
            </div>
          </div>

          <Footer />
        </main>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default About;

