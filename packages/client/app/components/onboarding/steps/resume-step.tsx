'use client';

import type React from 'react';

import { useState } from 'react';
import { FileUp, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import classNames from '@/utils/classnames';

interface ResumeStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function ResumeStep({ updateData }: ResumeStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      updateData({ resume: selectedFile });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      updateData({ resume: droppedFile });
    }
  };

  const removeFile = () => {
    setFile(null);
    updateData({ resume: null });
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

      {!file ? (
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
                <FileUp className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-lg">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={removeFile}
              className="h-9 w-9 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="text-center pt-6">
        <p className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg inline-block shadow-sm">
          Don't have a resume? No worries! You can add your leetcode username in
          the next step.
        </p>
      </div>
    </div>
  );
}
