import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return redirect('/login');

  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'No job ID provided' },
        { status: 400 }
      );
    }

    const analysisUrl =
      process.env.NEXT_PUBLIC_BACKEND_ANALYSIS_URL || 'http://localhost:3003';

    const response = await fetch(`${analysisUrl}/compare/job?jobId=${jobId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${response.statusText}`);
      console.error(`Response body: ${errorText}`);

      return NextResponse.json(
        { error: `Failed to compare job: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error comparing job:', error);

    return NextResponse.json(
      {
        error: 'Failed to compare job',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
