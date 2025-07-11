
import { sessionLogin, sessionLogout } from '@/lib/firebase/auth-edge-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return sessionLogout(request);
}

export async function POST(request: NextRequest) {
  return sessionLogin(request);
}
