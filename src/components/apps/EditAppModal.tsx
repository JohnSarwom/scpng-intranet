/**
 * EditAppModal Component
 * Modal for editing existing applications in SharePoint
 */

import React, { useState, useEffect } from 'react';
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
import { Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { AppsSharePointService, SharePointApp } from '@/services/appsSharePointService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';

interface EditAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    app: SharePointApp | null;
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

export const EditAppModal: React.FC<EditAppModalProps> = ({ isOpen, onClose, onSuccess, app }) => {
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
    const [currentIcon, setCurrentIcon] = useState<string>('');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate form when app changes
    useEffect(() => {
        if (app && isOpen) {
            setTitle(app.title);
            setAppId(app.appId);
            setDescription(app.description || '');
            setAppUrl(app.appUrl);
            setCategory(app.category || 'Custom');
            setIsExternal(app.isExternal ?? true);
            setDisplayOrder(app.displayOrder?.toString() || '100');
            setIsActive(app.isActive ?? true);

            // Determine if current icon is emoji or URL
            const isIconUrl = app.icon?.startsWith('http');
            setCurrentIcon(app.icon || '📦');

            if (isIconUrl) {
                setUseEmoji(false);
                setImagePreview(app.icon || null);
                setEmojiIcon('📦');
            } else {
                setUseEmoji(true);
                setEmojiIcon(app.icon || '📦');
                setImagePreview(null);
            }

            setImageFile(null);
            setError(null);
        }
    }, [app, isOpen]);

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

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!app || !app.id) {
            setError('No app selected for editing');
            return;
        }

        // Validation
        if (!title.trim()) {
            setError('App name is required');
            return;
        }
        if (!appUrl.trim()) {
            setError('App URL is required');
            return;
        }
        if (!useEmoji && !imageFile && !imagePreview) {
            setError('Please select an image or emoji icon');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get access token first
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

            // Determine icon URL
            let iconUrl = currentIcon;

            if (useEmoji) {
                iconUrl = emojiIcon;
            } else if (imageFile) {
                toast({
                    title: 'Uploading Image',
                    description: 'Uploading app icon to SharePoint...',
                });

                // Use service method which generates unique filename to avoid caching issues
                // and uses robust fetch API upload
                try {
                    iconUrl = await service.uploadAppImage(imageFile, app.appId, response.accessToken);
                } catch (uploadError: any) {
                    console.error('Upload failed via service:', uploadError);
                    throw new Error('Failed to upload image: ' + uploadError.message);
                }
            } else if (imagePreview) {
                // Keep existing image
                iconUrl = imagePreview;
            }

            // Update application in SharePoint
            toast({
                title: 'Updating Application',
                description: 'Saving changes to SharePoint...',
            });

            await service.updateApplication(app.id, {
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
                description: `${title} has been updated successfully.`,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error updating application:', err);
            setError(err.message || 'Failed to update application. Please try again.');
            toast({
                title: 'Error',
                description: err.message || 'Failed to update application',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete state
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Handle delete application
    const handleDelete = async () => {
        if (!app || !app.id) return;

        setIsDeleting(true);
        setError(null);

        try {
            // Get access token first (same login as submit)
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
            await service.deleteApplication(app.id);

            toast({
                title: 'Application Deleted',
                description: `${title} has been permanently deleted.`,
            });

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error('Error deleting application:', err);
            setError(err.message || 'Failed to delete application.');
            toast({
                title: 'Delete Failed',
                description: err.message || 'Could not delete application',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!app) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setShowDeleteConfirm(false); // Reset delete state on close
                onClose();
            }
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Application</DialogTitle>
                    <DialogDescription>
                        Update the application information or remove it.
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
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Outlook, Teams, Excel"
                            disabled={isSubmitting || isDeleting}
                            required
                        />
                    </div>

                    {/* App ID - Read Only */}
                    <div className="space-y-2">
                        <Label htmlFor="appId">
                            App ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="appId"
                            value={appId}
                            disabled={true}
                            className="bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">
                            App ID cannot be changed after creation.
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
                            disabled={isSubmitting || isDeleting}
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
                            disabled={isSubmitting || isDeleting}
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
                                }}
                                disabled={isSubmitting || isDeleting}
                            >
                                Use Emoji
                            </Button>
                            <Button
                                type="button"
                                variant={!useEmoji ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setUseEmoji(false)}
                                disabled={isSubmitting || isDeleting}
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
                                    disabled={isSubmitting || isDeleting}
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
                                            disabled={isSubmitting || isDeleting}
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
                                            disabled={isSubmitting || isDeleting}
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
                        <Select value={category} onValueChange={setCategory} disabled={isSubmitting || isDeleting}>
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
                                disabled={isSubmitting || isDeleting}
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
                                disabled={isSubmitting || isDeleting}
                            />
                        </div>
                    </div>

                    {/* Is Active */}
                    <div className="space-y-2">
                        <Label htmlFor="isActive">Status</Label>
                        <Select
                            value={isActive ? 'active' : 'inactive'}
                            onValueChange={(val) => setIsActive(val === 'active')}
                            disabled={isSubmitting || isDeleting}
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

                    <DialogFooter className="sm:justify-between gap-2">
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-2 w-full justify-between bg-red-50 p-2 rounded-md border border-red-100">
                                <div className="text-xs text-red-600 font-medium whitespace-nowrap">
                                    Are you sure? This cannot be undone.
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeleting}
                                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="h-8"
                                    >
                                        {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Delete'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isSubmitting}
                                >
                                    Delete App
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Application'
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditAppModal;
