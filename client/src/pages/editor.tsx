import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagBadge } from '@/components/tag-badge';
import { CreateTagDialog } from '@/dialogs/create-tag-dialog';
import { 
  ArrowLeft, 
  Check, 
  MoreVertical, 
  Plus, 
  Trash2,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Folder, Note, Tag } from '@shared/schema';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function Editor() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/edit/:id');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const isNewNote = params?.id === 'new';
  const noteId = params?.id !== 'new' ? parseInt(params?.id || '0') : undefined;
  
  // Fetch folders from API
  const { data: folders = [] } = useQuery<Folder[]>({ 
    queryKey: ['/api/folders'],
  });
  
  // Fetch tags from API
  const { data: tags = [] } = useQuery<Tag[]>({ 
    queryKey: ['/api/tags'],
  });
  
  // Fetch note data if editing an existing note
  const { data: noteData, isLoading: isLoadingNote } = useQuery<Note>({
    queryKey: ['/api/notes', noteId],
    queryFn: async () => {
      if (isNewNote || !noteId) throw new Error('Invalid note ID');
      const res = await fetch(`/api/notes/${noteId}`);
      if (!res.ok) throw new Error('Failed to fetch note');
      return await res.json();
    },
    enabled: !isNewNote && !!noteId,
  });
  
  // Create note mutation
  const { mutate: createNote, isPending: isCreating } = useMutation({
    mutationFn: async (note: { title: string; content: string; folderId: number | null }) => {
      const response = await apiRequest('POST', '/api/notes', note);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notes query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
      
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error creating note",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Update note mutation
  const { mutate: updateExistingNote, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: { title: string; content: string; folderId: number | null } }) => {
      const response = await apiRequest('PUT', `/api/notes/${id}`, note);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      if (noteId) {
        queryClient.invalidateQueries({ queryKey: ['/api/notes', noteId] });
      }
      
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
      
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error updating note",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Delete note mutation
  const { mutate: deleteExistingNote, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/notes/${id}`);
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
      
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error deleting note",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Load existing note data if editing
  useEffect(() => {
    if (!isNewNote && noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setSelectedFolder(noteData.folderId ? noteData.folderId.toString() : null);
      
      // We should fetch note tags later
      // For now just set an empty array
      setSelectedTags([]);
    }
  }, [isNewNote, noteData]);
  
  const isPending = isCreating || isUpdating || isDeleting;
  
  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your note.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert selectedFolder to number or null
    const folderId = selectedFolder ? parseInt(selectedFolder) : null;
    
    if (isNewNote) {
      // Create new note
      createNote({
        title: title.trim(),
        content,
        folderId,
      });
    } else if (noteId) {
      // Update existing note
      updateExistingNote({
        id: noteId,
        note: {
          title: title.trim(),
          content,
          folderId,
        }
      });
    }
  };
  
  const handleDelete = () => {
    if (noteId && !isNewNote) {
      deleteExistingNote(noteId);
      setDeleteDialogOpen(false);
    }
  };
  
  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 py-3 shadow-md z-10 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent/30 mr-2"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-medium text-white">
            {isNewNote ? 'New Note' : 'Edit Note'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent/30"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent/30"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-cardBg border-gray-700">
              {!isNewNote && (
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Note
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Editor Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Title"
            className="w-full px-3 py-2 bg-cardBg rounded-lg text-gray-400 placeholder-gray-400 border-none text-lg font-medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        {/* Folder/Tags Selection */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative">
            <Select 
              value={selectedFolder || 'none'} 
              onValueChange={(value) => setSelectedFolder(value === 'none' ? null : value)}
            >
              <SelectTrigger className="px-3 py-1.5 bg-cardBg rounded-lg text-white text-sm border-none focus:ring-accent">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-cardBg border-gray-700">
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center flex-wrap gap-1">
            {selectedTags.map((tagId) => {
              const tag = tags.find(t => t.id.toString() === tagId);
              if (!tag) return null;
              return (
                <TagBadge
                  key={tag.id}
                  name={tag.name}
                  color={tag.color}
                  onRemove={() => removeTag(tag.id.toString())}
                />
              );
            })}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 py-1 bg-cardBg rounded-full text-xs flex items-center h-auto"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span>Add Tag</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-cardBg border-gray-700">
                {tags.length > 0 ? (
                  tags
                    .filter(tag => !selectedTags.includes(tag.id.toString()))
                    .map(tag => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() => addTag(tag.id.toString())}
                        className="cursor-pointer"
                      >
                        <TagBadge name={tag.name} color={tag.color} className="mr-2" />
                      </DropdownMenuItem>
                    ))
                ) : (
                  <DropdownMenuItem
                    className="text-gray-400 cursor-default focus:bg-transparent"
                    disabled
                  >
                    No tags available
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => setCreateTagOpen(true)}
                  className="border-t border-gray-700 mt-1 pt-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new tag
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Rich Text Editor */}
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>
      
      {/* Create Tag Dialog */}
      <CreateTagDialog
        open={createTagOpen}
        onOpenChange={setCreateTagOpen}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-surface rounded-lg w-full max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Delete Note</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your note.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t border-gray-700 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
