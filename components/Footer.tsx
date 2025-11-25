import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const statesInfo = useTranslation({
    en: 'Malaysia consists of 13 states and 3 federal territories',
    ms: 'Malaysia terdiri daripada 13 negeri dan 3 wilayah persekutuan'
  });

  const dataSource = useTranslation({
    en: 'Data source: Department of Statistics Malaysia (DOSM) - https://data.gov.my/',
    ms: 'Sumber data: Jabatan Perangkaan Malaysia (DOSM) - https://data.gov.my/'
  });

  const followText = useTranslation({
    en: 'Follow on X',
    ms: 'Ikuti di X'
  });

  const privacyText = useTranslation({
    en: 'Privacy Policy',
    ms: 'Dasar Privasi'
  });

  const termsText = useTranslation({
    en: 'Terms of Service',
    ms: 'Terma Perkhidmatan'
  });

  const aboutText = useTranslation({
    en: 'About',
    ms: 'Tentang Kami'
  });

  return (
    <div className="mt-20 text-center text-sm text-zinc-600 dark:text-zinc-400">
      <p className="mb-2">{statesInfo}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4">
        {dataSource}
      </p>
      <div className="flex items-center justify-center gap-4 text-xs mb-4">
        <Link 
          href="https://x.com/mypeta_" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          {followText}
        </Link>
        <span className="text-zinc-400">|</span>
        <Link 
          href="/about" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          {aboutText}
        </Link>
        <span className="text-zinc-400">|</span>
        <Link 
          href="/privacy" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          {privacyText}
        </Link>
        <span className="text-zinc-400">|</span>
        <Link 
          href="/terms" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          {termsText}
        </Link>
      </div>
    </div>
  );
};

export default Footer;


