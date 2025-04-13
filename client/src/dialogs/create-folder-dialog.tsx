import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({ open, onOpenChange }: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Create a mutation for adding a new folder
  const { mutate: createFolder, isPending } = useMutation({
    mutationFn: async (folderName: string) => {
      const response = await apiRequest('POST', '/api/folders', { name: folderName });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate folders query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      
      // Show success toast
      toast({
        title: "Folder created",
        description: `Folder "${name.trim()}" has been created successfully.`,
      });
      
      // Reset form and close dialog
      setName('');
      onOpenChange(false);
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error creating folder",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = () => {
    if (name.trim()) {
      createFolder(name.trim());
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface rounded-lg w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="bg-cardBg border-none"
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && !isPending) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end border-t border-gray-700 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            style={{ backgroundColor: '#1F5C42' }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
