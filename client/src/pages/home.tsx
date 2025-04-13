import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import { NoteCard } from '@/components/note-card';
import { FolderNav } from '@/components/folder-nav';
import { MobileNav } from '@/components/mobile-nav';
import { CreateFolderDialog } from '@/dialogs/create-folder-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Note, Tag, Folder } from '@shared/schema';
import { 
  Search,
  Plus,
  MoreVertical,
  X,
  SortDesc
} from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  
  const activeFolder = useStore((state) => state.activeFolder);
  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);
  
  // Fetch notes from API
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<Note[]>({ 
    queryKey: ['/api/notes'],
  });
  
  // Fetch folders from API
  const { data: folders = [], isLoading: isLoadingFolders } = useQuery<Folder[]>({ 
    queryKey: ['/api/folders'],
  });
  
  // Fetch tags from API
  const { data: tags = [], isLoading: isLoadingTags } = useQuery<Tag[]>({ 
    queryKey: ['/api/tags'],
  });
  
  // Fetch notes by folder if an active folder is selected
  const { data: folderNotes = [] } = useQuery<Note[]>({
    queryKey: ['/api/folders', activeFolder, 'notes'],
    queryFn: async () => {
      if (!activeFolder) return notes;
      // Convert activeFolder to number if it's a string
      const folderId = typeof activeFolder === 'string' ? parseInt(activeFolder) : activeFolder;
      const res = await fetch(`/api/folders/${folderId}/notes`);
      if (!res.ok) throw new Error('Failed to fetch notes for folder');
      return await res.json();
    },
    enabled: !!activeFolder,
  });
  
  // Get filtered notes based on search query or active folder
  const filteredNotes = searchQuery
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeFolder
      ? folderNotes
      : notes;
  
  // Sort notes by updatedAt (most recent first)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  // Get only the 3 most recent notes for the "Recent Notes" section
  const recentNotes = sortedNotes.slice(0, 3);
  
  // Get note-tag relationships and map them for display
  // This is a placeholder function until we can properly fetch tags for notes
  const getTagsForNote = (noteId: number | string) => {
    return [];
  };
  
  // Create a new note
  const handleCreateNote = () => {
    setLocation('/edit/new');
  };
  
  // Clear search when component unmounts
  useEffect(() => {
    return () => {
      setSearchQuery('');
    };
  }, [setSearchQuery]);
  
  const isLoading = isLoadingNotes || isLoadingFolders || isLoadingTags;
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 py-3 shadow-md z-10 flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </span>
          <h1 className="font-semibold text-lg text-white">NoteGreen</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-accent/30"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-accent/30"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Search Bar */}
      {showSearch && (
        <div className="bg-surface px-4 py-2 shadow-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notes..."
              className="w-full pl-10 pr-10 py-2 bg-cardBg rounded-lg text-white placeholder-gray-400 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 h-7 w-7 rounded-full"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Folder Navigation */}
      <FolderNav onAddFolder={() => setFolderDialogOpen(true)} />
      
      {/* Notes Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-20 bg-background">
        {isLoading ? (
          // Loading state
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-3 bg-cardBg rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Recent Notes Section - only show if not searching and have multiple notes */}
            {!searchQuery && sortedNotes.length > 3 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium text-base">Recent Notes</h2>
                  <Button variant="link" size="sm" className="text-xs text-gray-400 h-auto p-0">
                    See all
                  </Button>
                </div>
                
                {recentNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    updatedAt={new Date(note.updatedAt)}
                    tags={getTagsForNote(note.id)}
                  />
                ))}
              </div>
            )}
            
            {/* All Notes Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-base">
                  {searchQuery 
                    ? 'Search Results' 
                    : activeFolder 
                      ? folders.find(f => {
                          const folderId = typeof activeFolder === 'string' ? parseInt(activeFolder) : activeFolder;
                          return f.id === folderId;
                        })?.name || 'Notes'
                      : 'All Notes'
                  }
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-surface transition-colors">
                  <SortDesc className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              
              {sortedNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-400 mb-4">No notes found</p>
                  <Button 
                    onClick={handleCreateNote}
                    style={{ backgroundColor: '#1F5C42' }}
                  >
                    Create your first note
                  </Button>
                </div>
              ) : (
                // Show all notes if not in "Recent Notes" mode, otherwise skip the first 3
                (searchQuery || sortedNotes.length <= 3 ? sortedNotes : sortedNotes.slice(3)).map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    updatedAt={new Date(note.updatedAt)}
                    tags={getTagsForNote(note.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Floating Action Button */}
      <Button
        className="absolute bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: '#1F5C42' }}
        onClick={handleCreateNote}
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Dialogs */}
      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
      />
    </div>
  );
}
