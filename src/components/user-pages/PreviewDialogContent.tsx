
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PreviewDialogContentProps {
  previewContent: {
    html: string;
    css: string;
    javascript: string;
  };
}

const PreviewDialogContent: React.FC<PreviewDialogContentProps> = ({ previewContent }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Preview</DialogTitle>
      </DialogHeader>
      <div className="border rounded-lg p-4 min-h-[500px] bg-white overflow-auto">
        <style dangerouslySetInnerHTML={{ __html: previewContent.css }} />
        <div dangerouslySetInnerHTML={{ __html: previewContent.html }} />
        <script dangerouslySetInnerHTML={{ __html: previewContent.javascript }} />
      </div>
    </>
  );
};

export default PreviewDialogContent;
