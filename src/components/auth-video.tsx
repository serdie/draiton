
'use client';

import { useState, useEffect } from 'react';

const videos = [
    "https://www.diemy.es/wp-content/uploads/2025/09/IA_para_Crecimiento_Empresarial-1.mp4",
    "https://www.diemy.es/wp-content/uploads/2025/09/It_generates_a_202509031621_c6ev2.mp4"
];

export function AuthVideo() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <video
                key={currentVideoIndex}
                className="absolute left-1/2 top-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
                src={videos[currentVideoIndex]}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnd}
            />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>
    );
}
