/**
 * Frontend health check endpoint
 */
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'frontend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      backend: {
        status: 'unknown',
        url: process.env.NEXT_PUBLIC_API_URL
      }
    };

    // Check backend connectivity
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        healthStatus.backend.status = 'healthy';
      } else {
        healthStatus.backend.status = 'unhealthy';
      }
    } catch (error) {
      healthStatus.backend.status = 'unhealthy';
    }

    const statusCode = healthStatus.backend.status === 'healthy' ? 200 : 503;
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}