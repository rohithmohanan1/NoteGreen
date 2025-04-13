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
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function Editor() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/edit/:id');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const addNote = useStore((state) => state.addNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);
  const getNoteById = useStore((state) => state.getNoteById);
  const folders = useStore((state) => state.folders);
  const tags = useStore((state) => state.tags);
  
  const isNewNote = params?.id === 'new';
  const noteId = params?.id;
  
  // Load existing note data if editing
  useEffect(() => {
    if (!isNewNote && noteId) {
      const note = getNoteById(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setSelectedFolder(note.folderId);
        setSelectedTags(note.tagIds);
      } else {
        // Note not found, redirect to home
        setLocation('/');
      }
    }
  }, [isNewNote, noteId, getNoteById, setLocation]);
  
  const handleSave = () => {
    if (!title.trim()) {
      return; // Don't save empty notes
    }
    
    if (isNewNote) {
      // Create new note
      addNote({
        title,
        content,
        folderId: selectedFolder,
        tagIds: selectedTags,
      });
    } else if (noteId) {
      // Update existing note
      updateNote(noteId, {
        title,
        content,
        folderId: selectedFolder,
        tagIds: selectedTags,
      });
    }
    
    setLocation('/');
  };
  
  const handleDelete = () => {
    if (noteId && !isNewNote) {
      deleteNote(noteId);
      setLocation('/');
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
          >
            <Check className="h-5 w-5" />
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
            className="w-full px-3 py-2 bg-cardBg rounded-lg text-white placeholder-gray-400 border-none text-lg font-medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        {/* Folder/Tags Selection */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative">
            <Select 
              value={selectedFolder || ''} 
              onValueChange={(value) => setSelectedFolder(value || null)}
            >
              <SelectTrigger className="px-3 py-1.5 bg-cardBg rounded-lg text-white text-sm border-none focus:ring-accent">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-cardBg border-gray-700">
                <SelectItem value="">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center flex-wrap gap-1">
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <TagBadge
                  key={tag.id}
                  name={tag.name}
                  color={tag.color}
                  onRemove={() => removeTag(tag.id)}
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
                    .filter((tag) => !selectedTags.includes(tag.id))
                    .map((tag) => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() => addTag(tag.id)}
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
