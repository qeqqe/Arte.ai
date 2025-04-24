'use client';

export async function saveOnboardingData(data: Record<string, any>) {
  if (data.resume instanceof File) {
    const formData = new FormData();
    formData.append('resume', data.resume);

    const otherData = { ...data };
    delete otherData.resume;
    formData.append('data', JSON.stringify(otherData));

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to save onboarding data');
    }

    return await response.json();
  } else {
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

    return await response.json();
  }
}

export async function fetchUserProfile() {
  const response = await fetch('/api/user/profile');

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return await response.json();
}
