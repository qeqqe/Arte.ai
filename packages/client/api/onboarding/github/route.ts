import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return redirect('/login');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_INGESTION_URL}/github/user-github`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Response body: ${errorText}`);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const rawText = await response.text();

    if (!rawText || rawText.trim() === '') {
      console.log('Received empty response from API');
      return NextResponse.json([]);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw response:', rawText);
      return NextResponse.json(
        { error: 'Invalid JSON response from server' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}
