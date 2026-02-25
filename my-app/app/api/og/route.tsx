import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(
    new URL('/og-image.png', 'https://www.intelliconcierge.com'),
    301,
  );
}
