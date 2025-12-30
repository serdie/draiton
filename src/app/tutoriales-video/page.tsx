import { VideoTutorials } from '@/components/landing/video-tutorials';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function VideoTutorialsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <VideoTutorials />
      </main>
      <Footer />
    </div>
  );
}