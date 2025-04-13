import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder } from '@shared/schema';

interface FolderNavProps {
  onAddFolder: () => void;
}

export function FolderNav({ onAddFolder }: FolderNavProps) {
  const [location, setLocation] = useLocation();
  const activeFolder = useStore((state) => state.activeFolder);
  const setActiveFolder = useStore((state) => state.setActiveFolder);
  
  // Fetch folders from API
  const { data: folders = [], isLoading } = useQuery<Folder[]>({ 
    queryKey: ['/api/folders'],
  });
  
  // Reset active folder when navigating to home
  useEffect(() => {
    if (location === '/') {
      setActiveFolder(null);
    }
  }, [location, setActiveFolder]);
  
  // Convert folder ID to string if needed for store compatibility
  const handleFolderClick = (id: number | string | null) => {
    if (id === null) {
      setActiveFolder(null);
    } else {
      // Convert to string to maintain compatibility with existing store
      setActiveFolder(id.toString());
    }
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
        
        {isLoading ? (
          // Loading state for folders
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full mr-2" />
          ))
        ) : (
          // Render folders
          folders.map((folder) => {
            const folderId = typeof activeFolder === 'string' ? 
              parseInt(activeFolder) : activeFolder;
              
            return (
              <button 
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                className={cn(
                  "folder-item whitespace-nowrap px-3 py-1 rounded-full text-sm mr-2 transition-colors",
                  folderId === folder.id ? "bg-accent/30" : ""
                )}
              >
                {folder.name}
              </button>
            );
          })
        )}
        
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
