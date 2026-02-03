
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, Check, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const BannerManagement = () => {
  const [banner, setBanner] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Check file type
    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file (JPEG, PNG)');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setUploadedFile(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = () => {
    // In a real app, you would upload the file to a server here
    // For now, we'll just simulate saving it
    setBanner(previewUrl);
    toast.success('Banner updated successfully');
  };
  
  const handleRemove = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setBanner(null);
    toast.info('Banner removed');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Management</CardTitle>
        <CardDescription>
          Upload and manage the homepage banner. Recommended size: 1200x300px, JPEG/PNG format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative max-h-[200px] overflow-hidden rounded-md">
                <img 
                  src={previewUrl} 
                  alt="Banner preview" 
                  className="w-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove();
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                {uploadedFile?.name} ({(uploadedFile?.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <Image className="h-10 w-10 text-muted-foreground mb-2" />
                <div className="text-sm font-medium">
                  Drag and drop your image here or click to browse
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  JPEG or PNG, max 5MB
                </div>
              </div>
              <Label htmlFor="banner-upload" className="cursor-pointer">
                <Input 
                  id="banner-upload"
                  type="file" 
                  accept="image/jpeg, image/png" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
                <Button type="button" variant="outline" className="w-full">
                  <Upload size={16} className="mr-2" /> Browse files
                </Button>
              </Label>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleRemove}
            disabled={!previewUrl}
          >
            Remove Banner
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!previewUrl}
          >
            <Check size={16} className="mr-2" /> Save Banner
          </Button>
        </div>
        
        {banner && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Current Live Banner</h3>
            <div className="rounded-md overflow-hidden border">
              <img src={banner} alt="Current banner" className="w-full" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BannerManagement;
