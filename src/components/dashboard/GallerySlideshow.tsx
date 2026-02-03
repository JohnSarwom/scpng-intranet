import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService, GalleryPhoto } from '@/integrations/supabase/galleryService';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const GallerySlideshow = () => {
    const [images, setImages] = useState<GalleryPhoto[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await galleryService.getGalleryData();
                const allImages: GalleryPhoto[] = [];
                // Sort years descending to ensure newest images are first
                const years = Object.keys(data).sort().reverse();

                years.forEach(year => {
                    data[year].forEach(event => {
                        if (event.images && event.images.length > 0) {
                            allImages.push(...event.images);
                        }
                    });
                });

                // Shuffle all images for random display
                const shuffledImages = shuffleArray(allImages);
                setImages(shuffledImages);
            } catch (error) {
                console.error("Failed to fetch gallery images for slideshow:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setImageError(false); // Reset error state for new image
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black/10 rounded-lg animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-white/10 rounded-lg border-2 border-dashed border-white/20 p-4 text-center">
                <ImageIcon className="h-8 w-8 text-white/40 mb-2" />
                <p className="text-white/60 text-xs font-medium">Add photos to the gallery to see them here</p>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    const handleImageClick = () => {
        if (currentImage) {
            navigate(`/gallery?imageId=${currentImage.id}`);
        }
    };

    return (
        <div
            className="relative w-full h-full overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 group cursor-pointer"
            onClick={handleImageClick}
        >
            <AnimatePresence mode="wait">
                {!imageError ? (
                    <motion.img
                        key={currentImage.id}
                        src={currentImage.image_url}
                        alt={currentImage.caption || "Gallery Image"}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <motion.div
                        key={`fallback-${currentImage.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white/30"
                    >
                        <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-xs">Image not available</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-medium line-clamp-1">
                    {currentImage.caption || "SCPNG Gallery"}
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                    {currentIndex + 1} / {images.length}
                </p>
            </div>
        </div>
    );
};

export default GallerySlideshow;
