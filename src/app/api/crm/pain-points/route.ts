import { NextResponse } from "next/server";
import { painPointService } from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const category = url.searchParams.get("category") ?? undefined;
      const severity = url.searchParams.get("severity") ?? undefined;
      const trend = url.searchParams.get("trend") ?? undefined;
      const contactId = url.searchParams.get("contactId") ?? undefined;
  
      const painPoints = await painPointService.list({ category, severity, trend, contactId: contactId || undefined });
      return NextResponse.json(painPoints, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await req.json();
  
      if (!body.category) {
        return NextResponse.json({ error: "category is required" }, { status: 400 });
      }
  
      const painPoint = await painPointService.create(body);
      return NextResponse.json(painPoint, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await req.json();
  
      if (!body.id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
  
      const { id, ...updates } = body;
      const painPoint = await painPointService.update(id, updates);
      return NextResponse.json(painPoint);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function DELETE(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
      }
  
      await painPointService.delete(id);
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
