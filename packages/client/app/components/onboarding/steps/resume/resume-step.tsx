'use client';

import { useState } from 'react';
import { FileUp, Upload, X, Check, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import classNames from '@/utils/classnames';
import ResumeDialog from './resume-dialog';

interface ResumeStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function ResumeStep({ data, updateData }: ResumeStepProps) {
  const [file, setFile] = useState<File | null>(data?.resume || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasTextResume, setHasTextResume] = useState(
    data?.hasTextResume || false
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      try {
        setUploadStatus('uploading');

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', selectedFile);

        // Upload to API endpoint
        const response = await fetch('/api/onboarding/resume', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload resume');
        }

        setUploadStatus('success');
        // Reset text resume state if file is uploaded
        setHasTextResume(false);
        updateData({
          resume: selectedFile,
          resumeUploaded: true,
          hasTextResume: false,
        });
      } catch (error: any) {
        console.error('Resume upload failed:', error);
        setUploadStatus('error');
        setErrorMessage(error.message || 'Failed to upload resume');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);

      try {
        setUploadStatus('uploading');

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', droppedFile);

        // Upload to API endpoint
        const response = await fetch('/api/onboarding/resume', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload resume');
        }

        setUploadStatus('success');
        // Reset text resume state if file is uploaded
        setHasTextResume(false);
        updateData({
          resume: droppedFile,
          resumeUploaded: true,
          hasTextResume: false,
        });
      } catch (error: any) {
        console.error('Resume upload failed:', error);
        setUploadStatus('error');
        setErrorMessage(error.message || 'Failed to upload resume');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    updateData({ resume: null, resumeUploaded: false });
  };

  const handleTextSubmit = async (text: string) => {
    try {
      setUploadStatus('uploading');

      // Send text to API endpoint
      const response = await fetch('/api/onboarding/resume-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit resume text');
      }

      setUploadStatus('success');
      setHasTextResume(true);
      setFile(null); // Clear any existing file
      updateData({
        resumeText: text,
        resumeUploaded: true,
        hasTextResume: true,
        resume: null,
      });
    } catch (error: any) {
      console.error('Resume text submission failed:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to submit resume text');
      throw error;
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="h-6 w-6 text-rose-600 animate-spin" />;
      case 'success':
        return <Check className="h-6 w-6 text-green-600" />;
      case 'error':
        return <X className="h-6 w-6 text-red-600" />;
      default:
        return hasTextResume ? (
          <Edit className="h-6 w-6 text-rose-600" />
        ) : (
          <FileUp className="h-6 w-6 text-rose-600" />
        );
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Processing...';
      case 'success':
        return hasTextResume
          ? 'Resume text submitted successfully'
          : 'Upload successful';
      case 'error':
        return errorMessage;
      default:
        return hasTextResume
          ? 'Your written resume'
          : `${file?.size ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB`;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'text-rose-500';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-8 flex-1">
      <div className="text-center mb-8 animate-fade-in">
        <div className="bg-gradient-to-br from-rose-100 to-rose-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
          <FileUp className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          This helps us understand your skills and experience better.
        </p>
      </div>

      {!file && !hasTextResume ? (
        <div
          className={classNames(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300',
            isDragging
              ? 'border-rose-500 bg-rose-50 shadow-md'
              : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('resume-upload')?.click()}
        >
          <div className="mx-auto flex flex-col items-center">
            <div className="bg-rose-100 rounded-full p-4 mb-5 shadow-md">
              <Upload className="h-10 w-10 text-rose-600" />
            </div>
            <h3 className="text-gray-800 font-medium text-lg mb-2">
              Drag and drop your resume
            </h3>
            <p className="text-gray-500 mb-5">or click to browse files</p>
            <p className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm">
              Supports PDF, DOCX, up to 5MB
            </p>

            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-gradient-to-r from-rose-50 to-white shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-100 rounded-lg shadow-sm">
                {getStatusIcon()}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-lg">
                  {hasTextResume ? 'Written Resume' : file?.name}
                </p>
                <p className={`text-sm mt-1 ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={removeFile}
              className="h-9 w-9 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors duration-200"
              disabled={uploadStatus === 'uploading'}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="text-center pt-6">
        <Button
          variant="outline"
          onClick={() => setDialogOpen(true)}
          className="text-sm text-rose-600 border-rose-200 hover:bg-rose-50 transition-all duration-200"
          disabled={uploadStatus === 'uploading'}
        >
          <Edit className="h-4 w-4 mr-2" />
          {hasTextResume
            ? 'Edit your written resume'
            : 'Write about your skills instead'}
        </Button>
      </div>

      <ResumeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleTextSubmit}
      />
    </div>
  );
}
