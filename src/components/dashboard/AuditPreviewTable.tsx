import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { SeverityBadge } from "@/components/investigation/SeverityBadge";
import { TableScroll } from "@/components/ui/table-scroll";

type AuditRow = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  severity: string;
  createdAt: string;
};

export function AuditPreviewTable({ audits }: { audits: AuditRow[] }) {
  return (
    <TableScroll>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audits.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="whitespace-nowrap text-perionyx-text-muted">{formatDateTime(a.createdAt)}</TableCell>
              <TableCell>
                <SeverityBadge severity={a.severity} />
              </TableCell>
              <TableCell className="max-w-[240px] truncate font-mono text-xs text-perionyx-text-muted">{a.action}</TableCell>
              <TableCell className="max-w-[260px] truncate text-sm text-perionyx-text-muted">
                {a.resourceType}
                {a.resourceId ? (
                  <span className="ml-2 block truncate text-xs text-perionyx-text-muted">{a.resourceId}</span>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}

