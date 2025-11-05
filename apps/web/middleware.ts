import { NextRequest, NextResponse } from 'next/server';

// Temporarily simplified middleware - just pass through
// This is to test if pages work without next-intl middleware
export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|.*\\..*).*)'
  ]
};








