import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MobileNav } from '@/components/mobile-nav';
import { CreateFolderDialog } from '@/dialogs/create-folder-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Folder, 
  MoreHorizontal, 
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function Folders() {
  const [, setLocation] = useLocation();
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  
  const folders = useStore((state) => state.folders);
  const deleteFolder = useStore((state) => state.deleteFolder);
  const updateFolder = useStore((state) => state.updateFolder);
  const getNotesByFolderId = useStore((state) => state.getNotesByFolderId);
  
  const handleDeleteFolder = () => {
    if (deleteFolderId) {
      deleteFolder(deleteFolderId);
      setDeleteFolderId(null);
    }
  };
  
  const handleEditFolder = () => {
    if (editFolderId && editFolderName.trim()) {
      updateFolder(editFolderId, { name: editFolderName.trim() });
      setEditFolderId(null);
      setEditFolderName('');
    }
  };
  
  const startEdit = (id: string, name: string) => {
    setEditFolderId(id);
    setEditFolderName(name);
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
          <h1 className="font-medium text-white">Folders</h1>
        </div>
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent/30"
          onClick={() => setCreateFolderOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>
      
      {/* Folders List */}
      <div className="flex-1 overflow-y-auto p-4">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Folder className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4">No folders yet</p>
            <Button 
              onClick={() => setCreateFolderOpen(true)}
              style={{ backgroundColor: '#1F5C42' }}
            >
              Create your first folder
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {folders.map((folder) => {
              const noteCount = getNotesByFolderId(folder.id).length;
              return (
                <Card key={folder.id} className="bg-cardBg border-none">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => {
                          useStore.getState().setActiveFolder(folder.id);
                          setLocation('/');
                        }}
                      >
                        <Folder className="h-5 w-5 mr-3 text-accent" />
                        <div>
                          <h3 className="font-medium text-white">{folder.name}</h3>
                          <p className="text-xs text-gray-400">{noteCount} note{noteCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-cardBg border-gray-700">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => startEdit(folder.id, folder.name)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500 cursor-pointer"
                            onClick={() => setDeleteFolderId(folder.id)}
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
      
      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteFolderId} onOpenChange={(open) => !open && setDeleteFolderId(null)}>
        <DialogContent className="bg-surface rounded-lg w-full max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Delete Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will delete the folder but keep all notes inside it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t border-gray-700 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteFolderId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteFolder}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Folder Dialog */}
      <Dialog open={!!editFolderId} onOpenChange={(open) => !open && setEditFolderId(null)}>
        <DialogContent className="bg-surface rounded-lg w-full max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              placeholder="Folder name"
              className="bg-cardBg border-none"
            />
          </div>
          <DialogFooter className="sm:justify-end border-t border-gray-700 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditFolderId(null);
                setEditFolderName('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditFolder}
              style={{ backgroundColor: '#1F5C42' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
