import { NextResponse } from 'next/server';
import { getPublicGitHubStats } from '@/lib/github/stats';

// Cache responses for 1 hour (3600 seconds) on the server edge, with stale-while-revalidate
export const revalidate = 3600;

export async function GET() {
  try {
    const stats = await getPublicGitHubStats();

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error: any) {
    console.error('Error serving GitHub stats API route:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve GitHub statistics' },
      { status: 500 }
    );
  }
}
