import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      console.error('No access token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_GATEWAY_URL}/user/profile`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch user profile: ${response.status} - ${errorText}`
      );
      return NextResponse.json(
        { error: `Failed to fetch user profile: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
