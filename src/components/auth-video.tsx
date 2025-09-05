
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
        <video
            key={currentVideoIndex}
            className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0"
            autoPlay
            loop={false}
            muted
            playsInline
            onEnded={handleVideoEnd}
        >
            <source src={videos[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}
