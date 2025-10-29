import Link from 'next/link';

const Footer = () => {
  return (
    <div className="mt-20 text-center text-sm text-zinc-600 dark:text-zinc-400">
      <p className="mb-2">Malaysia consists of 13 states and 3 federal territories</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4">
        {`Data source: Department of Statistics Malaysia (DOSM) - https://data.gov.my/`}
      </p>
      <div className="flex items-center justify-center gap-4 text-xs mb-4">
        <Link 
          href="https://x.com/mypeta_" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          Follow on X
        </Link>
        <span className="text-zinc-400">|</span>
        <Link 
          href="/privacy" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          Privacy Policy
        </Link>
        <span className="text-zinc-400">|</span>
        <Link 
          href="/terms" 
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
};

export default Footer;

