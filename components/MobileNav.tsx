import { useState, Children } from 'react';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileNavProps {
  children: React.ReactNode;
}

const MobileNav = ({ children }: MobileNavProps) => {
  const [open, setOpen] = useState(false);

  // Only close the sheet if clicking on a navigation link (anchor tag)
  const handleClick = (e: React.MouseEvent) => {
    // Check if the clicked element or any parent is an anchor tag
    let target = e.target as HTMLElement;
    while (target && target !== e.currentTarget) {
      if (target.tagName === 'A') {
        setOpen(false);
        return;
      }
      target = target.parentElement as HTMLElement;
    }
    // Don't close for other buttons (like profile or theme toggle)
  };

  return (
    <>
      {/* Desktop Navigation - hidden on mobile */}
      <div className="hidden md:flex items-center gap-3">
        {children}
      </div>

      {/* Mobile Navigation - visible only on mobile */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button 
              className="p-2 rounded-lg bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-900 dark:hover:bg-zinc-400 transition-colors shadow-md"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-zinc-400 dark:text-zinc-400" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8 p-4">
              {/* Close sheet only when clicking on navigation links */}
              {Children.toArray(children).map((child, index) => (
                <div 
                  key={index} 
                  onClick={handleClick} 
                  className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-center"
                >
                  {child}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileNav;

