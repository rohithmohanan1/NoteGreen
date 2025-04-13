import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { 
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  Info
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

export default function Settings() {
  const [, setLocation] = useLocation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // Get store state
  const store = useStore();
  
  // Create a JSON string of the current store state
  const exportData = () => {
    const data = {
      notes: store.notes,
      tags: store.tags,
      folders: store.folders,
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `notegreen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const resetApp = () => {
    // Clear local storage
    localStorage.removeItem('notegreen-storage');
    // Reload the page to reset the app state
    window.location.reload();
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
          <h1 className="font-medium text-white">Settings</h1>
        </div>
      </header>
      
      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Data Management */}
          <Card className="bg-cardBg border-none">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export and manage your notes data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-accent" />
                  <div>
                    <Label className="text-white">Export Data</Label>
                    <p className="text-xs text-gray-400">Save your notes as a backup</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-accent text-accent hover:bg-accent/10"
                  onClick={exportData}
                >
                  Export
                </Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <Label className="text-white">Reset App</Label>
                    <p className="text-xs text-gray-400">Delete all notes, tags, and folders</p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setResetDialogOpen(true)}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* About */}
          <Card className="bg-cardBg border-none">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-white">NoteGreen</p>
                  <p className="text-xs text-gray-400">Version 1.0.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-surface rounded-lg w-full max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Reset App</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently delete all your notes, tags, and folders. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t border-gray-700 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={resetApp}
            >
              Reset App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
