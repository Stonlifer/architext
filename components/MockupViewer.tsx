
import React, { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface MockupViewerProps {
    room: Room;
    onClose: () => void;
    generateImage: () => Promise<string>;
}

const MockupViewer: React.FC<MockupViewerProps> = ({ room, onClose, generateImage }) => {
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleGenerateImage = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newImage = await generateImage();
            setImages(prev => [...prev, newImage]);
            setCurrentIndex(images.length);
        } catch (e) {
            console.error(e);
            setError("Sorry, I couldn't generate a mockup. Please try again.");
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generateImage, images.length]);
    
    useEffect(() => {
        handleGenerateImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col relative"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">
                        Design Mockup: <span className="text-brand-accent">{room.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                <main className="flex-grow p-4 flex items-center justify-center relative min-h-0">
                    {isLoading && images.length === 0 && (
                        <div className="text-center">
                            <SparklesIcon className="w-16 h-16 text-brand-secondary mx-auto animate-pulse-slow"/>
                            <p className="mt-4 text-lg text-gray-300">Generating photorealistic mockup...</p>
                            <p className="text-sm text-gray-500">This can take a moment.</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center p-4 bg-red-900/50 border border-red-700 rounded-lg">
                           <p className="text-red-300">{error}</p>
                        </div>
                    )}
                    {images.length > 0 && (
                        <div className="w-full h-full relative">
                           <img src={images[currentIndex]} alt={`Mockup for ${room.name}`} className="object-contain w-full h-full rounded-lg" />
                           {images.length > 1 && (
                                <>
                                    <button onClick={goPrevious} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors">
                                        <ChevronLeftIcon className="w-6 h-6 text-white" />
                                    </button>
                                     <button onClick={goNext} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors">
                                        <ChevronLeftIcon className="w-6 h-6 text-white transform rotate-180" />
                                    </button>
                                </>
                           )}
                           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                               {images.map((_, index) => (
                                    <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}></div>
                               ))}
                           </div>
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-700 flex justify-end">
                    <button 
                        onClick={handleGenerateImage} 
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-white bg-brand-primary hover:bg-blue-800 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                       {isLoading ? (
                           <>
                           <SparklesIcon className="w-5 h-5 animate-spin" />
                            Generating...
                           </>
                       ) : (
                           <>
                           <CameraIcon className="w-5 h-5" />
                           Generate Another View
                           </>
                       )}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MockupViewer;
