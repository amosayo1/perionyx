import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function JsonPanel({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <Card className="border-zinc-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <pre className="max-h-96 overflow-auto rounded-md border border-zinc-200 bg-white p-3 text-xs text-zinc-800">
          {JSON.stringify(value, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

