
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface FileUploadProps {
  onFileContent: (content: string, type: 'html' | 'css' | 'javascript') => void;
  acceptedTypes: ('html' | 'css' | 'javascript')[];
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileContent, 
  acceptedTypes,
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, type: string}>>([]);

  const getAcceptAttribute = () => {
    const extensions = [];
    if (acceptedTypes.includes('html')) extensions.push('.html', '.htm');
    if (acceptedTypes.includes('css')) extensions.push('.css');
    if (acceptedTypes.includes('javascript')) extensions.push('.js', '.ts');
    return extensions.join(',');
  };

  const getFileType = (fileName: string): 'html' | 'css' | 'javascript' | null => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'html' || extension === 'htm') return 'html';
    if (extension === 'css') return 'css';
    if (extension === 'js' || extension === 'ts') return 'javascript';
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const fileType = getFileType(file.name);
      
      if (!fileType || !acceptedTypes.includes(fileType)) {
        toast.error("Invalid file type", {
          description: `Please upload ${acceptedTypes.join(', ')} files only`
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content, fileType);
        setUploadedFiles(prev => [...prev, { name: file.name, type: fileType }]);
        toast.success("File uploaded", {
          description: `${file.name} has been uploaded successfully`
        });
      };
      reader.readAsText(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptAttribute()}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Files</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload {acceptedTypes.join(', ')} files
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose Files
            </Button>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {file.type}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
