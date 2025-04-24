import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const resume = formData.get('resume') as File;
      const dataString = formData.get('data') as string;
      const data = JSON.parse(dataString);

      console.log('Resume file:', resume.name, resume.size);

      console.log('Onboarding data:', data);

      return NextResponse.json({
        success: true,
        message: 'Onboarding data with resume saved successfully',
      });
    } else {
      const data = await request.json();

      console.log('Onboarding data:', data);
      return NextResponse.json({
        success: true,
        message: 'Onboarding data saved successfully',
      });
    }
  } catch (error) {
    console.error('Error processing onboarding data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
