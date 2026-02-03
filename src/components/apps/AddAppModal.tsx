/**
 * AddAppModal Component
 * Modal for adding new applications to SharePoint
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { AppsSharePointService } from '@/services/appsSharePointService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Microsoft 365',
  'SCPNG Apps',
  'AI Apps',
  'Legal Apps',
  'Productivity',
  'Communication',
  'Utilities',
  'Custom',
  'HR Systems',
  'Finance Systems',
  'External Services',
];

export const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const { instance, accounts } = useMsal();
  const { uploadFile: uploadFileToSharePoint } = useSharePointUpload();

  // Form state
  const [title, setTitle] = useState('');
  const [appId, setAppId] = useState('');
  const [description, setDescription] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [category, setCategory] = useState('Custom');
  const [isExternal, setIsExternal] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('100');
  const [isActive, setIsActive] = useState(true);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useEmoji, setUseEmoji] = useState(false);
  const [emojiIcon, setEmojiIcon] = useState('📦');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAppIdManuallyEdited, setIsAppIdManuallyEdited] = useState(false);

  // Auto-generate App ID from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Only auto-generate if user hasn't manually edited the App ID
    if (!isAppIdManuallyEdited) {
      // Auto-generate app ID: lowercase, replace spaces with hyphens
      const generatedId = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setAppId(generatedId);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file (PNG, JPG, etc.)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setAppId('');
    setDescription('');
    setAppUrl('');
    setCategory('Custom');
    setIsExternal(true);
    setDisplayOrder('100');
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setUseEmoji(false);
    setEmojiIcon('📦');
    setError(null);
    setIsAppIdManuallyEdited(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('App name is required');
      return;
    }
    if (!appId.trim()) {
      setError('App ID is required');
      return;
    }
    if (!appUrl.trim()) {
      setError('App URL is required');
      return;
    }
    if (!useEmoji && !imageFile) {
      setError('Please select an image or emoji icon');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if provided (using proven SharePoint upload hook)
      let iconUrl = emojiIcon;
      if (!useEmoji && imageFile) {
        toast({
          title: 'Uploading Image',
          description: 'Uploading app icon to SharePoint...',
        });

        // Use the working SharePoint upload hook
        const uploadedUrl = await uploadFileToSharePoint(
          imageFile,
          '/sites/scpngintranet',
          'Asset Images',
          'AppImages'
        );

        if (!uploadedUrl) {
          throw new Error('Failed to upload image to SharePoint');
        }

        iconUrl = uploadedUrl;
      }

      // Add application to SharePoint list
      toast({
        title: 'Adding Application',
        description: 'Creating app entry in SharePoint...',
      });

      // Get access token
      const account = accounts[0];
      if (!account) {
        throw new Error('No account found. Please sign in.');
      }

      const response = await instance.acquireTokenSilent({
        scopes: ['Sites.ReadWrite.All'],
        account: account,
      });

      // Initialize Graph client
      const client = Client.init({
        authProvider: (done) => {
          done(null, response.accessToken);
        },
      });

      // Initialize service
      const service = new AppsSharePointService(client);
      await service.initialize();

      await service.addApplication({
        appId: appId.trim(),
        title: title.trim(),
        description: description.trim(),
        icon: iconUrl,
        appUrl: appUrl.trim(),
        category: category,
        isExternal: isExternal,
        displayOrder: parseInt(displayOrder) || 100,
        isActive: isActive,
      });

      toast({
        title: 'Success!',
        description: `${title} has been added successfully.`,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding application:', err);
      setError(err.message || 'Failed to add application. Please try again.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to add application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>
            Add a new application to the apps directory. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="title">
              App Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Outlook, Teams, Excel"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* App ID */}
          <div className="space-y-2">
            <Label htmlFor="appId">
              App ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="appId"
              value={appId}
              onChange={(e) => {
                setAppId(e.target.value);
                setIsAppIdManuallyEdited(true);
              }}
              placeholder="e.g., outlook, teams, excel"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500">
              Unique identifier (lowercase, no spaces). Auto-generated from app name.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the application"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* App URL */}
          <div className="space-y-2">
            <Label htmlFor="appUrl">
              App URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="appUrl"
              type="url"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://..."
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>
              Icon <span className="text-red-500">*</span>
            </Label>

            {/* Toggle between emoji and image */}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={useEmoji ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setUseEmoji(true);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                disabled={isSubmitting}
              >
                Use Emoji
              </Button>
              <Button
                type="button"
                variant={!useEmoji ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseEmoji(false)}
                disabled={isSubmitting}
              >
                Upload Image
              </Button>
            </div>

            {/* Emoji Input */}
            {useEmoji && (
              <div className="space-y-2">
                <Input
                  value={emojiIcon}
                  onChange={(e) => setEmojiIcon(e.target.value)}
                  placeholder="📦 Enter an emoji"
                  disabled={isSubmitting}
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">
                  Enter an emoji character (e.g., 📧 📝 📊 👥 ☁️)
                </p>
              </div>
            )}

            {/* Image Upload */}
            {!useEmoji && (
              <div className="space-y-2">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-24 object-contain rounded border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Is External */}
            <div className="space-y-2">
              <Label htmlFor="isExternal">Opens In</Label>
              <Select
                value={isExternal ? 'yes' : 'no'}
                onValueChange={(val) => setIsExternal(val === 'yes')}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">New Tab (External)</SelectItem>
                  <SelectItem value="no">Same Window</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="1"
                max="1000"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={isActive ? 'active' : 'inactive'}
              onValueChange={(val) => setIsActive(val === 'active')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Show to users)</SelectItem>
                <SelectItem value="inactive">Inactive (Hide from users)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppModal;
