import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return redirect('/login');

  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'No username provided' },
        { status: 400 }
      );
    }

    const ingestionUrl =
      process.env.NEXT_PUBLIC_BACKEND_INGESTION_URL || 'http://localhost:3002';

    const response = await fetch(`${ingestionUrl}/leetcode`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || response.statusText;

      return NextResponse.json(
        { error: `Failed to validate Leetcode username: ${errorMessage}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error validating Leetcode username:', error);

    return NextResponse.json(
      {
        error: 'Failed to validate Leetcode username',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
