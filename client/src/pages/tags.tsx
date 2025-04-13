import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MobileNav } from '@/components/mobile-nav';
import { CreateTagDialog } from '@/dialogs/create-tag-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Tag, 
  MoreHorizontal, 
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TagBadge } from '@/components/tag-badge';

export default function Tags() {
  const [, setLocation] = useLocation();
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  
  const tags = useStore((state) => state.tags);
  const deleteTag = useStore((state) => state.deleteTag);
  const getNotesByTagId = useStore((state) => state.getNotesByTagId);
  
  const handleDeleteTag = () => {
    if (deleteTagId) {
      deleteTag(deleteTagId);
      setDeleteTagId(null);
    }
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
          <h1 className="font-medium text-white">Tags</h1>
        </div>
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent/30"
          onClick={() => setCreateTagOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>
      
      {/* Tags List */}
      <div className="flex-1 overflow-y-auto p-4">
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Tag className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4">No tags yet</p>
            <Button 
              onClick={() => setCreateTagOpen(true)}
              style={{ backgroundColor: '#1F5C42' }}
            >
              Create your first tag
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => {
              const noteCount = getNotesByTagId(tag.id).length;
              return (
                <Card key={tag.id} className="bg-cardBg border-none">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <TagBadge name={tag.name} color={tag.color} className="mr-3" />
                        <p className="text-xs text-gray-400">{noteCount} note{noteCount !== 1 ? 's' : ''}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-cardBg border-gray-700">
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500 cursor-pointer"
                            onClick={() => setDeleteTagId(tag.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Create Tag Dialog */}
      <CreateTagDialog
        open={createTagOpen}
        onOpenChange={setCreateTagOpen}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTagId} onOpenChange={(open) => !open && setDeleteTagId(null)}>
        <DialogContent className="bg-surface rounded-lg w-full max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Delete Tag</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will delete the tag from all notes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t border-gray-700 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteTagId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTag}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
