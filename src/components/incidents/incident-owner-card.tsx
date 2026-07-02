"use client";

import { User, Users, Eye, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Incident } from "./types";

export function IncidentOwnerCard({ incident }: { incident: Incident }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
          {incident.owner.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{incident.owner}</p>
          <p className="text-xs text-zinc-500">{incident.team}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-zinc-600" />
          <span>{incident.team}</span>
        </div>
        {incident.watchers.length > 0 && (
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-zinc-600" />
            <span>{incident.watchers.join(", ")}</span>
          </div>
        )}
        {incident.escalationContact && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-zinc-600" />
            <span>{incident.escalationContact}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <User className="h-3 w-3" />
          Assign
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Users className="h-3 w-3" />
          Add Watcher
        </Button>
      </div>
    </div>
  );
}
