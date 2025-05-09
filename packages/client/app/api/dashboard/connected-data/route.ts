import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching connected data sources from API gateway...');
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      console.error('No access token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_GATEWAY_URL}/dashboard/connected-data-sources`;
    console.log(`Making request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch connected data sources: ${response.status} - ${errorText}`
      );
      return NextResponse.json(
        {
          error: `Failed to fetch connected data sources: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Connected data sources API response:', data);

    // Ensure we have a valid object
    return NextResponse.json(
      data || { github: false, leetcode: false, resume: false }
    );
  } catch (error) {
    console.error('Error fetching connected data sources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
