import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2, Plus, Calendar, Image } from 'lucide-react';
import { toast } from 'sonner';
import { galleryService } from '@/integrations/supabase/galleryService';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';
import { v4 as uuidv4 } from 'uuid';

// SharePoint Configuration for Gallery Photos
const SHAREPOINT_SITEPATH = "/sites/scpngintranet";
const SHAREPOINT_LIBRARY_NAME = "Asset Images";
const SHAREPOINT_TARGET_FOLDER = "GalleryPhotos";

interface GalleryEvent {
    id: string;
    title: string;
    date: string;
    description?: string;
    year: number;
}

interface AddPhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotoAdded: () => void; // Callback to refresh gallery data
}

const AddPhotoModal: React.FC<AddPhotoModalProps> = ({ isOpen, onClose, onPhotoAdded }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Form data
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventDescription, setNewEventDescription] = useState('');
    const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);
    const [captions, setCaptions] = useState<string[]>([]);

    // Data
    const [availableEvents, setAvailableEvents] = useState<GalleryEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile: uploadFileToSharePoint, isLoading: isUploadingSharePoint, error: sharePointError } = useSharePointUpload();

    // Load available events
    useEffect(() => {
        if (isOpen) {
            loadEvents();
        }
    }, [isOpen]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const loadEvents = async () => {
        setIsLoadingEvents(true);
        try {
            const events = await galleryService.getEvents();
            setAvailableEvents(events);
        } catch (error: any) {
            console.error('Error loading events:', error);
            toast.error('Failed to load events');
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setPreviews([]);
        setCaptions([]);
        setSelectedEventId('');
        setNewEventTitle('');
        setNewEventDate('');
        setNewEventDescription('');
        setIsCreatingNewEvent(false);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const validFiles: File[] = [];
        const newPreviews: string[] = [];
        const newCaptions: string[] = [];

        Array.from(files).forEach((file) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 10MB)`);
                return;
            }

            validFiles.push(file);
            newCaptions.push(''); // Initialize empty caption for each file

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target?.result as string);
                if (newPreviews.length === validFiles.length) {
                    setPreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });

        setSelectedFiles(validFiles);
        setCaptions(newCaptions);
        setUploadError(null);
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        const newCaptions = captions.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        setCaptions(newCaptions);
    };

    const handleCaptionChange = (index: number, caption: string) => {
        const newCaptions = [...captions];
        newCaptions[index] = caption;
        setCaptions(newCaptions);
    };

    const createNewEvent = async (): Promise<string | null> => {
        if (!newEventTitle.trim() || !newEventDate) {
            toast.error('Event title and date are required');
            return null;
        }

        try {
            const newEvent = await galleryService.createEvent({
                title: newEventTitle.trim(),
                date: newEventDate,
                description: newEventDescription.trim() || undefined,
            });

            toast.success('New event created successfully');
            await loadEvents(); // Refresh events list
            return newEvent.id;
        } catch (error: any) {
            console.error('Error creating event:', error);
            toast.error('Failed to create new event');
            return null;
        }
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select at least one photo');
            return;
        }

        let eventId = selectedEventId;

        // Create new event if needed
        if (isCreatingNewEvent) {
            const newEventId = await createNewEvent();
            if (!newEventId) return;
            eventId = newEventId;
        } else if (!eventId) {
            toast.error('Please select an event or create a new one');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const photoUploads = selectedFiles.map(async (file, index) => {
                // Upload to SharePoint
                const fileName = `${uuidv4()}-${file.name}`;

                const sharePointUrl = await uploadFileToSharePoint(
                    file,
                    SHAREPOINT_SITEPATH,
                    SHAREPOINT_LIBRARY_NAME,
                    SHAREPOINT_TARGET_FOLDER
                );

                if (!sharePointUrl) {
                    throw new Error(`Failed to upload ${file.name} to SharePoint`);
                }

                // Save to database
                const photoData = await galleryService.addPhoto({
                    event_id: eventId,
                    caption: captions[index]?.trim() || undefined,
                    image_url: sharePointUrl,
                    sharepoint_url: sharePointUrl,
                    file_name: file.name,
                    file_size: file.size,
                    display_order: index + 1,
                });

                return photoData;
            });

            await Promise.all(photoUploads);

            toast.success(`Successfully uploaded ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`);
            onPhotoAdded(); // Trigger gallery refresh
            onClose();
            resetForm();

        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadError(error.message || 'Failed to upload photos');
            toast.error('Failed to upload photos');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Add Photos to Gallery
                    </DialogTitle>
                    <DialogDescription>
                        Upload photos to your media gallery. You can select multiple photos and add them to an existing event or create a new one.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Event Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Event</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreatingNewEvent(!isCreatingNewEvent)}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {isCreatingNewEvent ? 'Select Existing' : 'Create New Event'}
                            </Button>
                        </div>

                        {isCreatingNewEvent ? (
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="event-title">Event Title *</Label>
                                        <Input
                                            id="event-title"
                                            value={newEventTitle}
                                            onChange={(e) => setNewEventTitle(e.target.value)}
                                            placeholder="e.g., Annual Meeting 2024"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="event-date">Event Date *</Label>
                                        <Input
                                            id="event-date"
                                            type="date"
                                            value={newEventDate}
                                            onChange={(e) => setNewEventDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="event-description">Description</Label>
                                    <Textarea
                                        id="event-description"
                                        value={newEventDescription}
                                        onChange={(e) => setNewEventDescription(e.target.value)}
                                        placeholder="Brief description of the event..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ) : (
                            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Select an event"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableEvents.map((event) => (
                                        <SelectItem key={event.id} value={event.id}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">{event.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Photos</Label>

                        {selectedFiles.length === 0 ? (
                            <div
                                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-lg font-medium mb-2">Choose photos to upload</p>
                                <p className="text-sm text-muted-foreground">
                                    Click here or drag and drop your images (JPG, PNG, GIF up to 10MB each)
                                </p>
                                <Button type="button" variant="outline" className="mt-4">
                                    Browse Files
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="relative border rounded-lg overflow-hidden">
                                            <div className="aspect-video relative">
                                                {previews[index] && (
                                                    <img
                                                        src={previews[index]}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <Input
                                                    placeholder="Add a caption..."
                                                    value={captions[index] || ''}
                                                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add More Photos
                                </Button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {uploadError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{uploadError}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isUploading || selectedFiles.length === 0}>
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPhotoModal;
