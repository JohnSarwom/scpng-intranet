import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (base64: string) => void;
  currentImage?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  currentImage,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onFileUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {preview && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveImage}
            className="h-7 px-2"
          >
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        </div>
      )}
      
      {preview ? (
        <div className="relative border rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Asset preview" 
            className="max-h-[200px] w-auto mx-auto object-contain" 
          />
        </div>
      ) : (
        <div 
          className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload an image of the asset</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG (max 5MB)</p>
        </div>
      )}
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload; 