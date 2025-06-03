import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
