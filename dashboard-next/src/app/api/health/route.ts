/**
 * Health Check Endpoint
 * Used by load balancers, monitoring, and orchestrators.
 * 
 * GET /api/health         — Quick liveness check
 * GET /api/health?deep=1  — Deep check including DB connectivity
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    server: 'ok' | 'error';
    database?: 'ok' | 'error' | 'skipped';
    memory?: {
      used: number;
      total: number;
      percentUsed: number;
    };
  };
  environment: string;
}

const startTime = Date.now();

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const deep = url.searchParams.get('deep') === '1';

  const health: HealthStatus = {
    status: 'healthy',
    version: process.env.npm_package_version || '2.0.1',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      server: 'ok',
    },
    environment: process.env.NODE_ENV || 'development',
  };

  // Memory usage
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
    health.checks.memory = {
      used: usedMB,
      total: totalMB,
      percentUsed: Math.round((usedMB / totalMB) * 100),
    };
  }

  // Deep check — verify MongoDB connectivity
  if (deep) {
    try {
      await connectDB();
      const state = mongoose.connection.readyState;
      health.checks.database = state === 1 ? 'ok' : 'error';
      if (state !== 1) health.status = 'degraded';
    } catch {
      health.checks.database = 'error';
      health.status = 'unhealthy';
    }
  } else {
    health.checks.database = 'skipped';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store',
      'X-Health-Status': health.status,
    },
  });
}
