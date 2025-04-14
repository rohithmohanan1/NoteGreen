import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useState, useEffect } from "react";

export function PWAInstallPrompt() {
  const { isInstallable, promptToInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a short delay if the app is installable
    if (isInstallable) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="bg-cardBg border-gray-700">
        <DialogHeader>
          <DialogTitle>Install NoteGreen</DialogTitle>
          <DialogDescription>
            Install NoteGreen on your device for quick access and offline
            functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setShowPrompt(false)}>
            Not now
          </Button>
          <Button
            onClick={() => {
              promptToInstall();
              setShowPrompt(false);
            }}
            style={{ backgroundColor: "#1F5C42" }}
          >
            Install
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
