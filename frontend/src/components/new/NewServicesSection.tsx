import { useInView } from "@/hooks/useParallax";
import { PenTool, Users, Film, Mic, Scissors, Subtitles } from "lucide-react";

const SERVICES_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/992485/2026-03-18/cfc0613b-8cde-401b-aaa8-9bffb267104a.png";

const services = [
  {
    icon: PenTool,
    title: "Сценарий",
    desc: "Пишем сценарий под ваш бриф и целевую аудиторию.",
    color: "from-[#9333EA] to-[#6B21A8]",
  },
  {
    icon: Users,
    title: "Персонажи",
    desc: "Дизайн и моделирование персонажей в стиле Pixar.",
    color: "from-[#6366F1] to-[#4338CA]",
  },
  {
    icon: Film,
    title: "Анимация",
    desc: "Полная 3D-анимация с мягким освещением и эмоциями.",
    color: "from-[#3B82F6] to-[#1D4ED8]",
  },
  {
    icon: Mic,
    title: "Озвучка",
    desc: "Подбор голосов и запись профессиональной озвучки.",
    color: "from-[#7C3AED] to-[#4338CA]",
  },
  {
    icon: Scissors,
    title: "Монтаж",
    desc: "Монтаж, цветокоррекция, звук под ключ.",
    color: "from-[#818CF8] to-[#4F46E5]",
  },
  {
    icon: Subtitles,
    title: "Субтитры",
    desc: "Субтитры на любом языке и адаптация под платформы.",
    color: "from-[#3B82F6] to-[#1D4ED8]",
  },
];

export default function NewServicesSection() {
  const { ref, isInView } = useInView();

  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6366F1]/15 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="new-gradient-text">Услуги</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            От сценария до субтитров — полный цикл создания персональных мультиков.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`relative transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#9333EA]/30 to-[#6366F1]/25 rounded-3xl blur-2xl" />
            <img src={SERVICES_IMG} alt="Services" className="relative rounded-3xl shadow-2xl w-full" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`group p-5 rounded-2xl glass hover:border-[#9333EA]/30 transition-all duration-500 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#9333EA]/10 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${(i + 2) * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <s.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
