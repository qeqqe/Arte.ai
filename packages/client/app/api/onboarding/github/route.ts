import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return redirect('/login');

  // For debugging
  console.log(
    'Making API request with token',
    accessToken.substring(0, 10) + '...'
  );

  try {
    const ingestionUrl = 'http://host.docker.internal:3002';

    const response = await fetch(`${ingestionUrl}/github/user-github`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const statusText = response.statusText;
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${statusText}`);
      console.error(`Response body: ${errorText}`);

      return NextResponse.json(
        { error: `Failed to fetch GitHub data: ${statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched GitHub data');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch GitHub data',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
