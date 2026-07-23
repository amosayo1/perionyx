import { NextResponse } from "next/server";
import { generateOpenApiJson, getOpenApiSpecMetadata } from "@/server/api-platform";

export async function GET() {
  const spec = generateOpenApiJson();

  return new NextResponse(spec, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": "attachment; filename=perionyx-openapi.json",
      "x-openapi-version": "3.1.0",
      "x-endpoint-count": String(getOpenApiSpecMetadata().endpointCount),
    },
  });
}
