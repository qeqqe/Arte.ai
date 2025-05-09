import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching recent jobs from API gateway...');
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      console.error('No access token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_GATEWAY_URL}/dashboard/recent-job-comparisons`;
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
        `Failed to fetch job comparisons: ${response.status} - ${errorText}`
      );
      return NextResponse.json(
        { error: `Failed to fetch job comparisons: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Recent jobs API response received');

    // Process data to ensure compatibility with both formats
    const processedData = Array.isArray(data)
      ? data.map((job) => {
          // Log structure of comparison for debugging
          if (job?.comparison) {
            console.log(
              'Job comparison structure keys:',
              Object.keys(job.comparison)
            );

            // Check if we're dealing with new format
            if (job.comparison.overallScore) {
              console.log(
                'Found new SkillGapAnalysis format with overallScore:',
                job.comparison.overallScore
              );
            }
          }

          return job;
        })
      : [];

    if (processedData.length === 0) {
      console.log('No recent job comparisons found in response');
    }

    // Return processed data or empty array if null or undefined
    return NextResponse.json(processedData || []);
  } catch (error) {
    console.error('Error fetching recent job comparisons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
