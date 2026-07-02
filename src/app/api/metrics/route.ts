import { NextResponse } from 'next/server';
import { getMetrics } from '@/modules/metrics/metrics';

export async function GET() {
  const metrics = await getMetrics();
  return new NextResponse(metrics, { headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' } });
}
