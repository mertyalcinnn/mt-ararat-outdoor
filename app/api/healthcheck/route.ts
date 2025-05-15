"use server";

import { NextRequest, NextResponse } from 'next/server';

// Self-check API - basit sistem durum kontrolü
export async function GET(request: NextRequest) {
  try {
    // Sistem hatalarını kontrol et
    const checks = {
      api: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
      memory: process.memoryUsage ? process.memoryUsage() : null,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not-set'
    };
    
    return NextResponse.json({
      status: 'ok',
      checks
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}