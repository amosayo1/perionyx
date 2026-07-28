import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { handleRouteError } from "@/server/http/handle-route";

const DemoRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  email: z.string().email("Please provide a valid business email").max(320),
  company: z.string().min(1, "Company is required").max(256),
  role: z.enum(["CFO", "Treasurer", "VP of Finance", "Controller", "Risk Officer", "CEO / Founder", "Engineer / Developer", "Other"]),
  phone: z.string().max(32).optional(),
  companySize: z.enum(["51–200 employees", "201–1,000 employees", "1,001–5,000 employees", "5,001–10,000 employees", "10,000+ employees"]).optional(),
  country: z.string().max(128).optional(),
  message: z.string().max(2048).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsed = DemoRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const demoRequest = await prisma.demoRequest.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        company: body.company.trim(),
        role: body.role,
        phone: body.phone || null,
        companySize: body.companySize || null,
        country: body.country || null,
        message: body.message?.trim() || null,
      },
    });

    return NextResponse.json({ id: demoRequest.id, status: demoRequest.status }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
