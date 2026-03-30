import { useState, useRef } from "react";
import { useInView } from "@/hooks/useParallax";
import { Play, Pause, Clock } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  duration: string;
  videoSrc: string;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: 1, title: "Предложение", category: "Love Story", duration: "4 мин", videoSrc: "/assets/videos/predlozhenie.mp4" },
  { id: 2, title: "Годовщина 30 лет", category: "Love Story", duration: "4 мин", videoSrc: "/assets/videos/godovshhina-30-let.mp4" },
  { id: 3, title: "Для жены", category: "Love Story", duration: "4 мин", videoSrc: "/assets/videos/dlya-zheny.mp4" },
  { id: 4, title: "15 лет в браке", category: "Love Story", duration: "2 мин", videoSrc: "/assets/videos/15-let-v-brake.mp4" },
  { id: 5, title: "1 минута без озвучки", category: "Love Story", duration: "1 мин", videoSrc: "/assets/videos/1-min-bez-ozvuchki.mp4" },
  { id: 6, title: "1.5 минуты без озвучки", category: "Love Story", duration: "1.5 мин", videoSrc: "/assets/videos/1-5-min-bez-ozvuchki.mp4" },
];

export default function PortfolioSection() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const { ref, isInView } = useInView();

  const togglePlay = (id: number) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing video
      if (playingId !== null && videoRefs.current[playingId]) {
        videoRefs.current[playingId]!.pause();
      }
      video.play();
      setPlayingId(id);
    }
  };

  return (
    <section id="portfolio" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2">
            <span className="gradient-text">Работы</span>
          </h2>
          <p className="text-white/70 text-lg font-medium mb-4">Галерея живых историй</p>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            От трогательных Love Story до масштабных семейных саг. Каждый мультфильм уникален, как и ваша история.
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTFOLIO_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className={`group relative rounded-2xl overflow-hidden glass hover:border-purple-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Video */}
              <div className="relative aspect-video overflow-hidden bg-black/50 cursor-pointer" onClick={() => togglePlay(item.id)}>
                <video
                  ref={(el) => { videoRefs.current[item.id] = el; }}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={item.videoSrc} type="video/mp4" />
                </video>
                {/* Play/Pause overlay */}
                <div className={`absolute inset-0 bg-black/30 transition-colors flex items-center justify-center ${playingId === item.id ? "opacity-0 hover:opacity-100" : "opacity-100"}`}>
                  <div className="w-14 h-14 rounded-full glass-strong flex items-center justify-center transition-transform hover:scale-110">
                    {playingId === item.id ? (
                      <Pause size={24} className="text-white" />
                    ) : (
                      <Play size={24} className="text-white ml-1" />
                    )}
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/90">
                  <Clock size={12} />
                  {item.duration}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-lg font-semibold text-white mt-1">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}