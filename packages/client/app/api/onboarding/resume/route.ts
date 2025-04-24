import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return redirect('/login');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ingestionUrl = process.env.NEXT_PUBLIC_BACKEND_INGESTION_URL;

    // Create a new FormData to forward the file
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch(`${ingestionUrl}/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const statusText = response.statusText;
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${statusText}`);
      console.error(`Response body: ${errorText}`);

      return NextResponse.json(
        { error: `Failed to upload resume: ${statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error uploading resume:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload resume',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
