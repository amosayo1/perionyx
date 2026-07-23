import type { SearchDocument, SearchQuery } from "./types";
import { can } from "@/server/iam/permissions";

export class SearchPermissionFilter {
  filter(
    documents: SearchDocument[],
    userPermissions: Set<string>,
    _query: SearchQuery,
  ): SearchDocument[] {
    return documents.filter((doc) => {
      if (!doc.requiredPermissions || doc.requiredPermissions.length === 0) return true;
      return doc.requiredPermissions.some((perm) => can(userPermissions, perm as never));
    });
  }
}

export const searchPermissionFilter = new SearchPermissionFilter();
