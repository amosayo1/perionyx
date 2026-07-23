"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Something went wrong", description = "An unexpected error occurred. Please try again.", onRetry, className }: ErrorStateProps) {
  return (
    <Card className={cn("border-red-500/20", className)}>
      <CardContent className="grid place-items-center gap-4 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-red-500/10 text-red-400 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
          <p className="mt-1 max-w-sm text-sm text-zinc-400">{description}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
