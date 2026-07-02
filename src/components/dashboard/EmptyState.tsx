import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel">
      <CardHeader>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-perionyx-text-primary">{title}</div>
          {description ? <div className="text-sm text-perionyx-text-muted">{description}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={action ? "" : "pt-0"}>{action ? <div>{action}</div> : null}</CardContent>
    </Card>
  );
}

