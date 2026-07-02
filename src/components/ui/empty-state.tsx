import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FileMinus } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
      <CardContent className="grid place-items-center gap-4 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[rgba(212,175,55,0.10)] text-perionyx-gold shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <FileMinus className="h-7 w-7" />
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight text-perionyx-text-primary">
          {title ?? "No data available"}
        </CardTitle>
        <CardDescription className="max-w-sm text-sm text-perionyx-text-muted">
          {description ?? "There is nothing to display here yet. Add items or refresh to continue."}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
