
'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const videos = [
    { src: "https://www.diemy.es/wp-content/uploads/2025/09/IA_para_Crecimiento_Empresarial-1.mp4", type: "video/mp4" },
    { src: "https://www.diemy.es/wp-content/uploads/2025/09/It_generates_a_202509031621_c6ev2.mp4", type: "video/mp4" }
];

export function AuthVideo() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    useEffect(() => {
        videoRefs.forEach((ref, index) => {
            const videoElement = ref.current;
            if (videoElement) {
                if (index === currentVideoIndex) {
                    videoElement.play().catch(error => console.error("Error al reproducir el video:", error));
                } else {
                    videoElement.pause();
                    videoElement.currentTime = 0;
                }
            }
        });
    }, [currentVideoIndex, videoRefs]);
    

  return (
    <div className="relative w-full h-full">
        {videos.map((video, index) => (
             <video 
                key={index}
                ref={videoRefs[index]}
                muted 
                playsInline
                className={cn(
                    "absolute z-0 w-full h-full object-cover transition-opacity duration-1000",
                    index === currentVideoIndex ? "opacity-100" : "opacity-0"
                )}
                onEnded={handleVideoEnd}
                poster="https://picsum.photos/seed/auth/1920/1080"
                data-ai-hint="abstract background"
            >
                <source src={video.src} type={video.type} />
            </video>
        ))}
      <div className="absolute z-10 w-full h-full bg-black/30"></div>
    </div>
  );
}
