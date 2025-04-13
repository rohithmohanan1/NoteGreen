import { useLocation, Link } from 'wouter';
import { Home, Folder, Tag, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-surface border-t border-gray-800 px-4 py-2 flex justify-around items-center">
      <Link href="/" className={cn(
          "flex flex-col items-center justify-center py-1 px-3",
          location === "/" ? "text-white" : "text-gray-400"
        )}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Notes</span>
      </Link>
      <Link href="/folders" className={cn(
          "flex flex-col items-center justify-center py-1 px-3",
          location === "/folders" ? "text-white" : "text-gray-400"
        )}>
          <Folder className="h-5 w-5" />
          <span className="text-xs mt-1">Folders</span>
      </Link>
      <Link href="/tags" className={cn(
          "flex flex-col items-center justify-center py-1 px-3",
          location === "/tags" ? "text-white" : "text-gray-400"
        )}>
          <Tag className="h-5 w-5" />
          <span className="text-xs mt-1">Tags</span>
      </Link>
      <Link href="/settings" className={cn(
          "flex flex-col items-center justify-center py-1 px-3",
          location === "/settings" ? "text-white" : "text-gray-400"
        )}>
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
      </Link>
    </nav>
  );
}
