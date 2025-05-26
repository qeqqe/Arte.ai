import { JobComparisonsResponse } from '@/types/dashboard';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching recent jobs from API gateway...');
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      console.error('No access token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_GATEWAY_URL}/dashboard/get-all-job-comparisons`;
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

    const data: JobComparisonsResponse = await response.json();
    console.log('Recent jobs API response received:', {
      hasRecentJobComparisons: !!data?.recentJobComparisons,
      comparisonsCount: data?.recentJobComparisons?.length || 0,
      username: data?.username,
      hasAvatarUrl: !!data?.avatarUrl,
    });

    if (!data || !data.recentJobComparisons) {
      console.log('No recent job comparisons found in response');
      return NextResponse.json([]);
    }

    const processedData = data.recentJobComparisons.map((job) => {
      if (job?.comparison) {
        console.log(
          'Job comparison structure keys:',
          Object.keys(job.comparison)
        );

        if (job.comparison.overallScore) {
          console.log(
            'Found new SkillGapAnalysis format with overallScore:',
            job.comparison.overallScore
          );
        }
      }

      // this is typically just a text string, not JSON
      let parsedJobInfo = null;
      if (typeof job.jobInfo === 'string') {
        // only try to parse if it looks like JSON (starts with { or [)
        if (
          job.jobInfo.trim().startsWith('{') ||
          job.jobInfo.trim().startsWith('[')
        ) {
          try {
            parsedJobInfo = JSON.parse(job.jobInfo);
          } catch (e) {
            console.warn('Failed to parse jobInfo as JSON:', e);
            // if parsing fails
            parsedJobInfo = { description: job.jobInfo };
          }
        } else {
          // plain text, wrap it in an object
          parsedJobInfo = { description: job.jobInfo };
        }
      } else {
        parsedJobInfo = job.jobInfo;
      }

      // parse processedSkills
      let processedSkills = job.processedSkills;
      if (typeof job.processedSkills === 'string') {
        try {
          processedSkills = JSON.parse(job.processedSkills);
        } catch (e) {
          console.warn('Failed to parse processedSkills:', e);
        }
      }

      // return job with additional user info and parsed data
      return {
        ...job,
        parsedJobInfo,
        processedSkills,
        username: data.username,
        avatarUrl: data.avatarUrl,
      };
    });

    console.log(`Processed ${processedData.length} job comparisons`);

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching recent job comparisons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
