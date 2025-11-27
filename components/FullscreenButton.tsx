import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const FullscreenButton: React.FC = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Error toggling fullscreen:", err);
        }
    };

    return (
        <button
            onClick={toggleFullscreen}
            className="fixed bottom-4 right-4 z-50 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 text-gray-700 hover:bg-white hover:text-rose-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
        >
            {isFullscreen ? (
                <Minimize className="w-6 h-6" />
            ) : (
                <Maximize className="w-6 h-6" />
            )}
        </button>
    );
};

export default FullscreenButton;
