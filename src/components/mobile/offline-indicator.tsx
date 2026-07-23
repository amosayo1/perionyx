"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface OfflineIndicatorProps {
  onRetry?: () => void;
  className?: string;
}

export function OfflineIndicator({ onRetry, className }: OfflineIndicatorProps) {
  const { isOnline, quality } = useOnlineStatus();
  const isOffline = quality === "offline";

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "sticky top-0 z-50 flex items-center justify-center gap-2 bg-red-600/90 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm",
            className,
          )}
        >
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>You are offline. Some data may be stale.</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-2 flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] active:bg-white/30"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { isOnline, quality } = useOnlineStatus();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          quality === "online" && "bg-emerald-500",
          quality === "offline" && "bg-red-500",
        )}
      />
      <span className="text-[10px] text-zinc-600">
        {quality === "online" ? "Connected" : quality === "offline" ? "Offline" : "Slow connection"}
      </span>
    </div>
  );
}
