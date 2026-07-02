import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { handleRouteError } from "@/server/http/handle-route";

const requiredFields = ["name", "email", "company", "role"] as const;
const allowedRoles = ["CFO", "Treasurer", "VP of Finance", "Controller", "Risk Officer", "CEO / Founder", "Engineer / Developer", "Other"];
const allowedSizes = ["51–200 employees", "201–1,000 employees", "1,001–5,000 employees", "5,001–10,000 employees", "10,000+ employees"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json(
          { error: { message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.` } },
          { status: 400 },
        );
      }
    }

    if (!body.email.includes("@")) {
      return NextResponse.json(
        { error: { message: "Please provide a valid business email." } },
        { status: 400 },
      );
    }

    if (body.role && !allowedRoles.includes(body.role)) {
      return NextResponse.json(
        { error: { message: "Please select a valid role." } },
        { status: 400 },
      );
    }

    if (body.companySize && !allowedSizes.includes(body.companySize)) {
      return NextResponse.json(
        { error: { message: "Please select a valid company size." } },
        { status: 400 },
      );
    }

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
