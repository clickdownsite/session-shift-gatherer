
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface FileUploadProps {
  onFileUpload: (content: string, type: 'html' | 'css' | 'javascript') => void;
  acceptedTypes: Array<'html' | 'css' | 'javascript'>;
  maxFileSize?: number; // in bytes
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedTypes,
  maxFileSize = 1024 * 1024, // 1MB default
  className = ''
}) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxFileSize) {
      toast.error(`File size too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
      return;
    }

    // Determine file type based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    let fileType: 'html' | 'css' | 'javascript' | null = null;

    if (extension === 'html' || extension === 'htm') {
      fileType = 'html';
    } else if (extension === 'css') {
      fileType = 'css';
    } else if (extension === 'js' || extension === 'javascript') {
      fileType = 'javascript';
    }

    if (!fileType || !acceptedTypes.includes(fileType)) {
      toast.error(`Unsupported file type. Please upload ${acceptedTypes.join(', ')} files only.`);
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onFileUpload(content, fileType);
        toast.success(`${fileType.toUpperCase()} file uploaded successfully`);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  }, [onFileUpload, acceptedTypes, maxFileSize]);

  const getAcceptString = () => {
    const extensions: Record<string, string> = {
      html: '.html,.htm',
      css: '.css',
      javascript: '.js'
    };
    return acceptedTypes.map(type => extensions[type]).join(',');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="file"
        accept={getAcceptString()}
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button type="button" variant="outline" size="sm" asChild>
          <span className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </span>
        </Button>
      </label>
      <span className="text-sm text-muted-foreground">
        {acceptedTypes.map(type => type.toUpperCase()).join(', ')} files
      </span>
    </div>
  );
};

export default FileUpload;
