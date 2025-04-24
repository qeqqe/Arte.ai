'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string) => Promise<void>;
  initialText?: string;
}

export default function ResumeDialog({
  open,
  onOpenChange,
  onSubmit,
  initialText = '',
}: ResumeDialogProps) {
  const [text, setText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && initialText) {
      setText(initialText);
    }
  }, [open, initialText]);

  const charCount = text.trim().length;
  const isValid = charCount >= 200 && charCount <= 4000;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(text);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit your resume information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white border border-rose-100 shadow-lg">
        <DialogHeader className="border-b border-rose-100 pb-3">
          <DialogTitle className="flex items-center gap-2 text-rose-700 text-xl">
            <div className="bg-rose-100 p-1.5 rounded-full">
              <FileText className="h-5 w-5" />
            </div>
            Tell us about your skills and experience
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1.5">
            Write about your technical skills, projects, and work experience.
            This helps us analyze your profile better.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your technical skills, education, work experience, and notable projects..."
            className="min-h-[300px] resize-none border-gray-200 focus-visible:ring-rose-500 focus-visible:border-rose-300 shadow-sm"
          />

          <div className="flex items-center justify-between mt-3 text-sm">
            <div
              className={`font-medium ${charCount > 0 && !isValid ? 'text-red-500' : 'text-gray-500'}`}
            >
              {charCount} / 4000 characters
            </div>
            {charCount < 200 && (
              <div className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">
                At least 200 characters required
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-100">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-rose-100 pt-3 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-gray-200 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`${isValid ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-300 cursor-not-allowed'} text-white`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
