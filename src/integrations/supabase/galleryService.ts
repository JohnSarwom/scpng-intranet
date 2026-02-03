import { supabase } from '@/lib/supabaseClient';

export interface GalleryEvent {
    id: string;
    title: string;
    date: string;
    description?: string;
    year: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
    is_active: boolean;
}

export interface GalleryPhoto {
    id: string;
    event_id: string;
    caption?: string;
    image_url: string;
    sharepoint_url?: string;
    file_name?: string;
    file_size?: number;
    display_order: number;
    created_at: string;
    updated_at: string;
    uploaded_by?: string;
    is_active: boolean;
}

export interface GalleryEventWithPhotos extends GalleryEvent {
    images: GalleryPhoto[];
}

export interface GalleryData {
    [year: string]: GalleryEventWithPhotos[];
}

class GalleryService {
    /**
     * Get all gallery events with their photos, organized by year
     */
    async getGalleryData(): Promise<GalleryData> {
        try {
            console.log('🔍 [GalleryService] Starting getGalleryData...');

            // First, get all active events
            const { data: events, error: eventsError } = await supabase
                .from('gallery_events')
                .select('*')
                .eq('is_active', true)
                .order('date', { ascending: false });

            if (eventsError) {
                console.error('❌ [GalleryService] Error fetching events:', eventsError);
                throw eventsError;
            }

            console.log('✅ [GalleryService] Events fetched:', events?.length, 'events');
            console.log('📄 [GalleryService] Events data:', events);

            if (!events || events.length === 0) {
                console.log('⚠️ [GalleryService] No events found, returning empty data');
                return {};
            }

            // Then, get all active photos
            const { data: photos, error: photosError } = await supabase
                .from('gallery_photos')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (photosError) {
                console.error('❌ [GalleryService] Error fetching photos:', photosError);
                throw photosError;
            }

            console.log('✅ [GalleryService] Photos fetched:', photos?.length, 'photos');
            console.log('📸 [GalleryService] Photos data sample:', photos?.slice(0, 3));

            if (!photos || photos.length === 0) {
                console.log('⚠️ [GalleryService] No photos found, returning empty data');
                return {};
            }

            // Manually join the data
            const galleryData: GalleryData = {};

            events.forEach((event: any) => {
                console.log(`🔗 [GalleryService] Processing event: ${event.title} (${event.id})`);

                // Find photos for this event
                const eventPhotos = photos.filter((photo: any) => photo.event_id === event.id);
                console.log(`📸 [GalleryService] Found ${eventPhotos.length} photos for event ${event.title}`);

                // Only include events that have photos
                if (eventPhotos.length > 0) {
                    const year = event.year.toString();

                    const eventWithPhotos: GalleryEventWithPhotos = {
                        ...event,
                        images: eventPhotos.map((photo: any) => ({
                            ...photo,
                            url: photo.image_url, // Add legacy 'url' field for compatibility
                        }))
                    };

                    if (!galleryData[year]) {
                        galleryData[year] = [];
                    }
                    galleryData[year].push(eventWithPhotos);

                    console.log(`✅ [GalleryService] Added event ${event.title} to year ${year}`);
                } else {
                    console.log(`⚠️ [GalleryService] Skipping event ${event.title} - no photos`);
                }
            });

            // Sort events within each year by date (newest first)
            Object.keys(galleryData).forEach(year => {
                galleryData[year].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                console.log(`📅 [GalleryService] Sorted ${galleryData[year].length} events for year ${year}`);
            });

            console.log('🎉 [GalleryService] Final gallery data:', galleryData);
            console.log('📊 [GalleryService] Years with data:', Object.keys(galleryData));

            return galleryData;
        } catch (error) {
            console.error('💥 [GalleryService] Error in getGalleryData:', error);
            throw error;
        }
    }

    /**
     * Get all active gallery events (for dropdown selections)
     */
    async getEvents(): Promise<GalleryEvent[]> {
        try {
            const { data, error } = await supabase
                .from('gallery_events')
                .select('*')
                .eq('is_active', true)
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching gallery events:', error);
            throw error;
        }
    }

    /**
     * Create a new gallery event
     */
    async createEvent(eventData: {
        title: string;
        date: string;
        description?: string;
    }): Promise<GalleryEvent> {
        try {
            const { data, error } = await supabase
                .from('gallery_events')
                .insert({
                    ...eventData,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating gallery event:', error);
            throw error;
        }
    }

    /**
     * Add a photo to a gallery event
     */
    async addPhoto(photoData: {
        event_id: string;
        caption?: string;
        image_url: string;
        sharepoint_url?: string;
        file_name?: string;
        file_size?: number;
        display_order?: number;
    }): Promise<GalleryPhoto> {
        try {
            const { data, error } = await supabase
                .from('gallery_photos')
                .insert({
                    ...photoData,
                    is_active: true,
                    display_order: photoData.display_order || 0
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding gallery photo:', error);
            throw error;
        }
    }

    /**
     * Update a photo's caption or display order
     */
    async updatePhoto(photoId: string, updates: {
        caption?: string;
        display_order?: number;
    }): Promise<GalleryPhoto> {
        try {
            const { data, error } = await supabase
                .from('gallery_photos')
                .update(updates)
                .eq('id', photoId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating gallery photo:', error);
            throw error;
        }
    }

    /**
     * Permanently delete a photo from storage and database
     */
    async deletePhoto(photoId: string): Promise<void> {
        try {
            console.log(`🗑️ [GalleryService] Attempting to delete photo: ${photoId}`);

            // 1. Get the photo details to find the file path
            const { data: photo, error: fetchError } = await supabase
                .from('gallery_photos')
                .select('image_url')
                .eq('id', photoId)
                .single();

            if (fetchError || !photo) {
                console.error('❌ [GalleryService] Error fetching photo details:', fetchError);
                throw new Error('Photo not found or could not be fetched.');
            }

            console.log(`📄 [GalleryService] Photo details fetched:`, photo);

            // 2. Delete the file from Supabase storage
            // Extract the file path from the full URL
            const bucketName = 'gallery-photos'; // Make sure this matches your bucket name
            const urlParts = photo.image_url.split(`${bucketName}/`);
            const filePath = urlParts.length > 1 ? urlParts[1] : null;

            if (filePath) {
                console.log(`🔥 [GalleryService] Deleting file from storage: ${filePath}`);
                const { error: storageError } = await supabase.storage
                    .from(bucketName)
                    .remove([filePath]);

                if (storageError) {
                    // Log the error but proceed to delete the DB record anyway
                    console.error('⚠️ [GalleryService] Error deleting file from storage:', storageError);
                    // Depending on requirements, you might want to throw an error here
                    // For now, we'll allow the DB record to be deleted even if storage fails
                } else {
                    console.log(`✅ [GalleryService] File deleted from storage successfully.`);
                }
            } else {
                console.warn(`⚠️ [GalleryService] Could not determine file path from URL: ${photo.image_url}`);
            }

            // 3. Delete the photo record from the database
            const { error: dbError } = await supabase
                .from('gallery_photos')
                .delete()
                .eq('id', photoId);

            if (dbError) {
                console.error('❌ [GalleryService] Error deleting photo from database:', dbError);
                throw dbError;
            }

            console.log(`✅ [GalleryService] Photo record deleted from database successfully.`);
        } catch (error) {
            console.error('💥 [GalleryService] Final error in deletePhoto:', error);
            throw error;
        }
    }

    /**
     * Permanently delete multiple photos from storage and database
     */
    async deleteMultiplePhotos(photoIds: string[]): Promise<void> {
        try {
            console.log(`🗑️ [GalleryService] Attempting to delete multiple photos:`, photoIds);

            if (!photoIds || photoIds.length === 0) {
                console.log('⚠️ [GalleryService] No photo IDs provided for deletion.');
                return;
            }

            // 1. Get photo details for all photos to be deleted
            const { data: photos, error: fetchError } = await supabase
                .from('gallery_photos')
                .select('id, image_url')
                .in('id', photoIds);

            if (fetchError) {
                console.error('❌ [GalleryService] Error fetching details for multiple photos:', fetchError);
                throw fetchError;
            }

            if (!photos || photos.length === 0) {
                console.warn('⚠️ [GalleryService] None of the provided photo IDs were found.');
                return;
            }

            console.log(`📄 [GalleryService] Details fetched for ${photos.length} photos.`);

            // 2. Delete files from Supabase storage
            const bucketName = 'gallery-photos';
            const filePaths = photos
                .map(p => {
                    const urlParts = p.image_url.split(`${bucketName}/`);
                    return urlParts.length > 1 ? urlParts[1] : null;
                })
                .filter((path): path is string => path !== null);

            if (filePaths.length > 0) {
                console.log(`🔥 [GalleryService] Deleting ${filePaths.length} files from storage.`);
                const { error: storageError } = await supabase.storage
                    .from(bucketName)
                    .remove(filePaths);

                if (storageError) {
                    console.error('⚠️ [GalleryService] Error deleting files from storage:', storageError);
                    // Continue to delete DB records even if storage deletion fails
                } else {
                    console.log(`✅ [GalleryService] ${filePaths.length} files deleted from storage.`);
                }
            }

            // 3. Delete photo records from the database
            const { error: dbError } = await supabase
                .from('gallery_photos')
                .delete()
                .in('id', photoIds);

            if (dbError) {
                console.error('❌ [GalleryService] Error deleting photo records from database:', dbError);
                throw dbError;
            }

            console.log(`✅ [GalleryService] ${photoIds.length} photo records deleted from database.`);
        } catch (error) {
            console.error('💥 [GalleryService] Final error in deleteMultiplePhotos:', error);
            throw error;
        }
    }

    /**
     * Update an event
     */
    async updateEvent(eventId: string, updates: {
        title?: string;
        date?: string;
        description?: string;
    }): Promise<GalleryEvent> {
        try {
            const { data, error } = await supabase
                .from('gallery_events')
                .update(updates)
                .eq('id', eventId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating gallery event:', error);
            throw error;
        }
    }

    /**
     * Permanently delete an event and all its photos.
     */
    async deleteEventPermanently(eventId: string): Promise<void> {
        try {
            console.log(`🗑️ [GalleryService] Permanently deleting event: ${eventId}`);

            // 1. Get all photos for the event
            const { data: photos, error: photosError } = await supabase
                .from('gallery_photos')
                .select('id, image_url')
                .eq('event_id', eventId);

            if (photosError) {
                console.error(`❌ [GalleryService] Error fetching photos for event ${eventId}:`, photosError);
                throw photosError;
            }

            if (photos && photos.length > 0) {
                const photoIds = photos.map(p => p.id);
                console.log(`📸 [GalleryService] Found ${photos.length} photos to delete for event ${eventId}.`);

                // 2. Delete photo files from storage
                const bucketName = 'gallery-photos';
                const filePaths = photos
                    .map(p => {
                        const urlParts = p.image_url.split(`${bucketName}/`);
                        return urlParts.length > 1 ? urlParts[1] : null;
                    })
                    .filter((path): path is string => path !== null);

                if (filePaths.length > 0) {
                    console.log(`🔥 [GalleryService] Deleting ${filePaths.length} files from storage.`);
                    const { error: storageError } = await supabase.storage
                        .from(bucketName)
                        .remove(filePaths);
                    if (storageError) {
                        console.error('⚠️ [GalleryService] Error deleting files from storage:', storageError);
                        // Decide if you want to proceed or throw. For now, we log and continue.
                    }
                }

                // 3. Delete photo records from the database
                console.log(`🗑️ [GalleryService] Deleting ${photoIds.length} photo records from DB.`);
                const { error: dbPhotosError } = await supabase
                    .from('gallery_photos')
                    .delete()
                    .in('id', photoIds);

                if (dbPhotosError) {
                    console.error('❌ [GalleryService] Error deleting photo records from DB:', dbPhotosError);
                    throw dbPhotosError;
                }
            } else {
                console.log(`ℹ️ [GalleryService] No photos found for event ${eventId}.`);
            }

            // 4. Delete the event record itself
            console.log(`🗑️ [GalleryService] Deleting event record ${eventId} from DB.`);
            const { error: dbEventError } = await supabase
                .from('gallery_events')
                .delete()
                .eq('id', eventId);

            if (dbEventError) {
                console.error('❌ [GalleryService] Error deleting event record from DB:', dbEventError);
                throw dbEventError;
            }

            console.log(`✅ [GalleryService] Event ${eventId} and all its assets permanently deleted.`);

        } catch (error) {
            console.error(`💥 [GalleryService] Final error in deleteEventPermanently for event ${eventId}:`, error);
            throw error;
        }
    }

    /**
     * Delete an event (soft delete by setting is_active to false)
     * This will also cascade to hide all photos in the event
     */
    async softDeleteEvent(eventId: string): Promise<void> {
        try {
            // First, deactivate all photos in the event
            await supabase
                .from('gallery_photos')
                .update({ is_active: false })
                .eq('event_id', eventId);

            // Then deactivate the event
            const { error } = await supabase
                .from('gallery_events')
                .update({ is_active: false })
                .eq('id', eventId);

            if (error) throw error;
        } catch (error) {
            console.error('Error soft deleting gallery event:', error);
            throw error;
        }
    }
}

export const galleryService = new GalleryService();
