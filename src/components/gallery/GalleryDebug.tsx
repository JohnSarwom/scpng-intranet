import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { galleryService } from '@/integrations/supabase/galleryService';
import { supabase } from '@/lib/supabaseClient';

const GalleryDebug: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [photos, setPhotos] = useState<any[]>([]);
    const [galleryData, setGalleryData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const testDirectQuery = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Testing direct Supabase queries...');

            // Test events query
            const { data: eventsData, error: eventsError } = await supabase
                .from('gallery_events')
                .select('*')
                .eq('is_active', true);

            if (eventsError) {
                throw new Error(`Events query failed: ${eventsError.message}`);
            }

            console.log('Events from direct query:', eventsData);
            setEvents(eventsData || []);

            // Test photos query
            const { data: photosData, error: photosError } = await supabase
                .from('gallery_photos')
                .select('*')
                .eq('is_active', true);

            if (photosError) {
                throw new Error(`Photos query failed: ${photosError.message}`);
            }

            console.log('Photos from direct query:', photosData);
            setPhotos(photosData || []);

            // Test joined query
            const { data: joinedData, error: joinedError } = await supabase
                .from('gallery_events')
                .select(`
          *,
          gallery_photos(*)
        `)
                .eq('is_active', true);

            if (joinedError) {
                throw new Error(`Joined query failed: ${joinedError.message}`);
            }

            console.log('Joined data:', joinedData);

            // Test galleryService
            const serviceData = await galleryService.getGalleryData();
            console.log('Service data:', serviceData);
            setGalleryData(serviceData);

        } catch (err: any) {
            console.error('Debug test failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Gallery Debug Tool</CardTitle>
                <CardDescription>
                    Test gallery data fetching to diagnose issues
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={testDirectQuery} disabled={loading}>
                    {loading ? 'Testing...' : 'Test Data Fetching'}
                </Button>

                {error && (
                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                        <h3 className="font-semibold text-red-800">Error:</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">Events ({events.length})</h3>
                        <div className="bg-gray-100 p-3 rounded text-xs max-h-40 overflow-y-auto">
                            <pre>{JSON.stringify(events, null, 2)}</pre>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Photos ({photos.length})</h3>
                        <div className="bg-gray-100 p-3 rounded text-xs max-h-40 overflow-y-auto">
                            <pre>{JSON.stringify(photos, null, 2)}</pre>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Gallery Data</h3>
                        <div className="bg-gray-100 p-3 rounded text-xs max-h-40 overflow-y-auto">
                            <pre>{JSON.stringify(galleryData, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GalleryDebug;
