import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { useLocation } from 'wouter';

interface FolderNavProps {
  onAddFolder: () => void;
}

export function FolderNav({ onAddFolder }: FolderNavProps) {
  const [location, setLocation] = useLocation();
  const folders = useStore((state) => state.folders);
  const activeFolder = useStore((state) => state.activeFolder);
  const setActiveFolder = useStore((state) => state.setActiveFolder);
  
  // Reset active folder when navigating to home
  useEffect(() => {
    if (location === '/') {
      setActiveFolder(null);
    }
  }, [location, setActiveFolder]);
  
  const handleFolderClick = (id: string | null) => {
    setActiveFolder(id);
    setLocation('/');
  };
  
  return (
    <ScrollArea className="bg-surface px-4 py-2 flex items-center overflow-x-auto hide-scrollbar">
      <div className="flex items-center">
        <button 
          onClick={() => handleFolderClick(null)}
          className={cn(
            "folder-item whitespace-nowrap px-3 py-1 rounded-full text-sm mr-2 transition-colors",
            activeFolder === null ? "bg-accent/30" : ""
          )}
        >
          All Notes
        </button>
        
        {folders.map((folder) => (
          <button 
            key={folder.id}
            onClick={() => handleFolderClick(folder.id)}
            className={cn(
              "folder-item whitespace-nowrap px-3 py-1 rounded-full text-sm mr-2 transition-colors",
              activeFolder === folder.id ? "bg-accent/30" : ""
            )}
          >
            {folder.name}
          </button>
        ))}
        
        <button 
          onClick={onAddFolder}
          className="whitespace-nowrap px-2 py-1 rounded-full text-sm text-gray-400 flex items-center"
        >
          <Plus className="h-3 w-3 mr-1" />
          <span>New</span>
        </button>
      </div>
    </ScrollArea>
  );
}
