// Temporarily simplified middleware for debugging
// If pages work without middleware, the issue is with next-intl configuration
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Just pass through for now
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

