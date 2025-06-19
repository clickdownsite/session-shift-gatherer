
import React, { useEffect, useRef } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PreviewDialogContentProps {
  previewContent: {
    html: string;
    css: string;
    javascript: string;
  };
}

const PreviewDialogContent: React.FC<PreviewDialogContentProps> = ({ previewContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Create complete HTML document
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { margin: 0; padding: 16px; font-family: Arial, sans-serif; }
                ${previewContent.css || ''}
              </style>
            </head>
            <body>
              ${previewContent.html || '<p>No content to preview</p>'}
              <script>
                // Mock global functions for preview
                window.submitSessionData = function(data) {
                  console.log('Form data (preview mode):', data);
                  alert('Form submitted in preview mode: ' + JSON.stringify(data, null, 2));
                };
                
                ${previewContent.javascript || ''}
              </script>
            </body>
          </html>
        `;
        
        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();
      }
    }
  }, [previewContent]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Preview</DialogTitle>
      </DialogHeader>
      <div className="border rounded-lg overflow-hidden min-h-[500px] bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-[500px] border-0"
          title="Page Preview"
          sandbox="allow-scripts allow-forms allow-modals"
        />
      </div>
    </>
  );
};

export default PreviewDialogContent;
