import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_OPTIONS = [
  { name: 'Red', value: '#CC3300' },
  { name: 'Orange', value: '#FF9900' },
  { name: 'Yellow', value: '#FFCC00' },
  { name: 'Green', value: '#33CC66' },
  { name: 'Blue', value: '#3399FF' },
  { name: 'Purple', value: '#9966FF' },
  { name: 'Pink', value: '#FF66CC' },
  { name: 'Gray', value: '#AAAAAA' },
];

export function CreateTagDialog({ open, onOpenChange }: CreateTagDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const addTag = useStore((state) => state.addTag);
  
  const handleSubmit = () => {
    if (name.trim()) {
      addTag({ name: name.trim(), color });
      setName('');
      setColor(COLOR_OPTIONS[0].value);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface rounded-lg w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Create New Tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tagName">Tag Name</Label>
            <Input
              id="tagName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tag name"
              className="bg-cardBg border-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Tag Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded-full hover:ring-2 hover:ring-white transition-all ${
                    color === option.value ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setColor(option.value)}
                  aria-label={`Select ${option.name} color`}
                />
              ))}
            </div>
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
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
