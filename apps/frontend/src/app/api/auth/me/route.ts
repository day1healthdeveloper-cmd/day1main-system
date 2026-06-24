import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
