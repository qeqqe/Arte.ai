import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return redirect('/login');

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided or invalid format' },
        { status: 400 }
      );
    }

    const ingestionUrl =
      process.env.NEXT_PUBLIC_BACKEND_INGESTION_URL || 'http://localhost:3002';

    const response = await fetch(`${ingestionUrl}/resume/upload-text`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      credentials: 'include',
    });

    if (!response.ok) {
      const statusText = response.statusText;
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${statusText}`);
      console.error(`Response body: ${errorText}`);

      return NextResponse.json(
        { error: `Failed to upload resume text: ${statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error uploading resume text:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload resume text',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
