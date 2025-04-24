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
