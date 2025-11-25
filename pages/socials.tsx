import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import globeAnimationData from '@/public/lottie/globe.json';
import { ArrowRight, Globe, TrendingUp, Newspaper } from 'lucide-react';

const Socials = () => {
  const title = "My Peta";
  const description = "Visualizing Malaysia through data, polls, and news.";

  const links = [
    {
      id: 'website',
      title: 'Visit Website',
      url: '/',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    },
    {
      id: 'twitter',
      title: 'X (Twitter)',
      url: 'https://x.com/mypeta_',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'bg-black hover:bg-zinc-900 text-white',
    },
    {
      id: 'threads',
      title: 'Threads',
      url: 'https://www.threads.net/@mypeta__',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M12.2728 5.99842C15.3106 5.99842 17.773 8.46092 17.773 11.4986C17.773 14.5363 15.3106 16.9986 12.2728 16.9986C9.23511 16.9986 6.77271 14.5363 6.77271 11.4986C6.77271 8.46092 9.23511 5.99842 12.2728 5.99842ZM12.2728 8.16667C10.4323 8.16667 8.94088 9.65808 8.94088 11.4986C8.94088 13.3391 10.4323 14.8305 12.2728 14.8305C14.1134 14.8305 15.6047 13.3391 15.6047 11.4986C15.6047 9.65808 14.1134 8.16667 12.2728 8.16667Z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M12.2728 0.5C18.348 0.5 23.2727 5.42487 23.2727 11.5C23.2727 17.5751 18.348 22.5 12.2728 22.5C6.19768 22.5 1.27271 17.5751 1.27271 11.5C1.27271 5.42487 6.19768 0.5 12.2728 0.5ZM3.44093 11.5C3.44093 16.3778 7.39516 20.3322 12.2728 20.3322C17.1505 20.3322 21.1049 16.3778 21.1049 11.5C21.1049 6.62218 17.1505 2.66777 12.2728 2.66777C7.39516 2.66777 3.44093 6.62218 3.44093 11.5Z" />
        </svg>
      ),
      color: 'bg-black hover:bg-zinc-900 text-white',
    },
    {
      id: 'polls',
      title: 'Vote on Polls',
      url: '/polls',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 'news',
      title: 'Read Latest News',
      url: '/news',
      icon: <Newspaper className="w-5 h-5" />,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
    }
  ];

  return (
    <>
      <Head>
        <title>My Peta - Socials</title>
        <meta name="description" content="Connect with My Peta" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            background-color: #111114;
            color: #f4f4f5;
            font-family: monospace;
          }
        `}</style>
      </Head>

      <div 
        className="min-h-screen flex flex-col items-center py-12 px-4 text-zinc-100"
        style={{
          backgroundImage: 'url("/images/background/bg-black-square.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto', // Or specific size if needed
          backgroundPosition: 'center',
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto flex flex-col items-center p-8 rounded-3xl border border-white/5"
        >
          {/* Profile Section */}
          <div className="h-32 mb-6 relative">
             <img src="/images/map/map-white.png" alt="My Peta" className="w-full h-full object-cover opacity-50" />
          </div>

          <h1 className="text-2xl font-bold mb-2 tracking-tight text-zinc-100">
            {title}
          </h1>
          
          <p className="text-center text-zinc-400 mb-8 max-w-sm">
            {description}
          </p>

          {/* Links Section */}
          <div className="w-full space-y-4">
            {links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Link 
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  className={`
                    flex items-center justify-between w-full p-4 rounded-xl shadow-sm 
                    hover:shadow-md transition-all duration-200 transform hover:-translate-y-1
                    ${link.color} border border-white/5
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-1">
                      {link.icon}
                    </div>
                    <span className="font-semibold tracking-wide">
                      {link.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} My Peta
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Socials;
