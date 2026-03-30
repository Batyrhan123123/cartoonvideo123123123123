import { useParallax } from "@/hooks/useParallax";
import { Sparkles, BadgeCheck, FileText, MapPin, Clock } from "lucide-react";

const HERO_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/992485/2026-03-18/1ba40c0f-8251-45f2-b598-cbe2ba19ee2a.png";
const BG_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/992485/2026-03-18/f8f1c436-bfe8-4b74-a0b4-1106b1e74b83.png";

const badges = [
  { icon: BadgeCheck, label: "Полное сходство" },
  { icon: FileText, label: "Индивидуальный сценарий" },
  { icon: MapPin, label: "Живые локации" },
  { icon: Clock, label: "Готовность от 24 часов" },
];

export default function NewHeroSection() {
  const scrollY = useParallax();

  return (
    <section className="relative min-h-screen flex items-start overflow-hidden pt-[100px]">
      <div
        className="absolute inset-0 opacity-30"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <img src={BG_IMG} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0514] via-[#0B0514]/80 to-[#0B0514]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0514] via-transparent to-[#0B0514]/50" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-[#9333EA]/30 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6366F1]/25 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6]/15 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-[#C084FC]">
              <Sparkles size={16} className="text-[#A855F7]" />
              <span>Студия 3D-анимации</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]">
              <span className="new-gradient-text">Станьте героями собственного мультфильма</span>
              <br />
              <span className="text-white">в стиле Pixar.</span>
            </h1>

            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              Персональные мультфильмы по вашим фото и воспоминаниям. Подари лучшие эмоции своим близким.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() =>
                  document.querySelector("#contacts")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 rounded-full new-gradient-btn text-white font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#9333EA]/25"
              >
                Заказать проект
              </button>
              <button
                onClick={() =>
                  document.querySelector("#contacts")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 rounded-full glass text-white font-semibold hover:bg-white/10 transition-all hover:scale-105"
              >
                Узнать стоимость
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70"
                >
                  <b.icon size={16} className="text-[#A855F7]" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative hidden lg:block"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#9333EA]/35 to-[#6366F1]/30 rounded-3xl blur-2xl" />
              <img
                src={HERO_IMG}
                alt="Персональный мультфильм в стиле Pixar"
                className="relative rounded-3xl shadow-2xl shadow-[#9333EA]/20 w-full animate-float-slow"
              />
              <div className="absolute -bottom-4 -left-4 glass-strong rounded-2xl px-5 py-3 animate-float" style={{ animationDelay: "1s" }}>
                <div className="text-xs text-[#C084FC]">Качество</div>
                <div className="text-lg font-bold text-white">4K Render</div>
              </div>
              <div className="absolute -top-4 -right-4 glass-strong rounded-2xl px-5 py-3 animate-float" style={{ animationDelay: "3s" }}>
                <div className="text-xs text-[#A5B4FC]">Срок</div>
                <div className="text-lg font-bold text-white">1–3 дня</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/30">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
