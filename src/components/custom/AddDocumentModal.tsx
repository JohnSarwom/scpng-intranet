import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onShare: (documentData: {
    title: string;
    description: string;
    tags?: string;
    file?: File | null;
    category: string;
    subCategory?: string | null;
  }) => void;
  initialCategory?: string;
  availableCategories: string[];
  subCategoryMap?: Record<string, string[]>;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onOpenChange,
  onShare,
  initialCategory,
  availableCategories = [],
  subCategoryMap = {},
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const currentSubCategories = selectedCategory ? (subCategoryMap[selectedCategory] || []) : [];
  const showSubCategoryDropdown = currentSubCategories.length > 0;

  useEffect(() => {
    if (isOpen) {
      const currentInitialCategory = initialCategory || (availableCategories.length > 0 ? availableCategories[0] : '');
      setSelectedCategory(currentInitialCategory);
      setSelectedSubCategory(null);
    } else {
      setTitle('');
      setDescription('');
      setTags('');
      setSelectedFile(null);
      setFileError(null);
      setSelectedSubCategory(null);
    }
  }, [isOpen, initialCategory, availableCategories]);

  // ... (handleFileChange, handleShareClick remain same)

  // Copying handleShareClick again to ensure context is right if I replaced too much,
  // but I can just replace lines 55-75 and props.

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      setFileError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleShareClick = () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    if (!selectedFile) {
      setFileError('Please select a file to share.');
      return;
    }
    if (!selectedCategory) {
      alert('Please select a category for the document.');
      return;
    }
    onShare({
      title,
      description,
      tags,
      file: selectedFile,
      category: selectedCategory,
      subCategory: selectedSubCategory
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share New Document</DialogTitle>
          <DialogDescription>
            Fill in the details, select a file, and choose a category (and sub-category if applicable).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category*
            </Label>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedSubCategory(null);
            }}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSubCategoryDropdown && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subCategory" className="text-right">
                Sub-Category
              </Label>
              <Select value={selectedSubCategory || ''} onValueChange={(value) => setSelectedSubCategory(value === '' ? null : value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a sub-category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- None --</SelectItem>
                  {currentSubCategories.map((subCat) => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title*
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Document Title"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Brief description of the document (optional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="col-span-3"
              placeholder="e.g., report, Q3, finance (comma-separated)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File*
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {fileError && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 text-sm text-red-600">
                {fileError}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleShareClick}
            disabled={!title.trim() || !selectedFile || !selectedCategory}
          >
            Share Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentModal; 