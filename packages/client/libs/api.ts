'use client';

export async function saveOnboardingData(data: Record<string, any>) {
  try {
    if (data.resume instanceof File) {
      const formData = new FormData();
      formData.append('file', data.resume);

      // Handle resume upload first
      const resumeResponse = await fetch('/api/onboarding/resume', {
        method: 'POST',
        body: formData,
      });

      if (!resumeResponse.ok) {
        const error = await resumeResponse.json();
        throw new Error(error.error || 'Failed to upload resume');
      }

      // Remove resume from data as it's already uploaded
      const { resume, ...restData } = data;
      data = restData;
    }

    // Submit the rest of the onboarding data
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save onboarding data');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
}

export async function fetchUserProfile() {
  const response = await fetch('/api/user/profile');

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return await response.json();
}

export async function compareToJob(jobId: string) {
  try {
    console.log(`Making API request to /api/jobs/compare with jobId: ${jobId}`);

    const response = await fetch(`/api/jobs/compare?jobId=${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      let errorMessage = `Failed to compare job (${response.status})`;

      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorData?.details || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage += `: ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error comparing to job:', error);
    throw error;
  }
}
