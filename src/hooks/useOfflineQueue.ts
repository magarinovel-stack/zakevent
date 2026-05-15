import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QueueItem { action: () => Promise<unknown>; metadata: Record<string, unknown>; }

export function useOfflineQueue() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); processQueue(); };
    const handleOffline = () => { setIsOffline(true); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, [queue]);

  const addToQueue = (action: () => Promise<unknown>, metadata: Record<string, unknown>) => {
    if (!navigator.onLine) {
      setQueue(prev => [...prev, { action, metadata }]);
      toast.success("Queued offline");
      return true;
    }
    return false;
  };

  const processQueue = async () => {
    for (const item of queue) { try { await item.action(); } catch {} }
    setQueue([]);
  };

  return { isOffline, addToQueue, queueLength: queue.length };
}
