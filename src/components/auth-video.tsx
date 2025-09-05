'use client';

export function AuthVideo() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <video
                className="absolute left-1/2 top-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
                src="https://www.diemy.es/wp-content/uploads/2025/09/pexels-tima-miroshnichenko-6694421-2-1.mp4"
                autoPlay
                loop
                muted
                playsInline
            />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>
    );
}
