import { useInView, useParallax } from "@/hooks/useParallax";
import { ClipboardList, PenTool, LayoutGrid, Film, CheckCircle } from "lucide-react";

const steps = [
  { num: 1, icon: ClipboardList, title: "Бриф", desc: "Заполняете форму или созваниваемся — фиксируем задачу и пожелания." },
  { num: 2, icon: PenTool, title: "Сценарий", desc: "Пишем сценарий и согласовываем с вами." },
  { num: 3, icon: LayoutGrid, title: "Раскадровка", desc: "Визуальная раскадровка ключевых сцен для утверждения." },
  { num: 4, icon: Film, title: "Анимация", desc: "Создаём анимацию, показываем черновые версии для правок." },
  { num: 5, icon: CheckCircle, title: "Сдача", desc: "Финальный рендер 4K, передача файлов и прав." },
];

export default function NewProcessSection() {
  const { ref, isInView } = useInView();
  const scrollY = useParallax();

  return (
    <section id="process" className="relative py-24 sm:py-32 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9333EA]/8 rounded-full blur-[200px]"
        style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.05}px))` }}
      />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="new-gradient-text">Как мы работаем</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Прозрачный процесс от брифа до сдачи проекта.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-6 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#9333EA]/60 via-[#6366F1]/50 to-[#3B82F6]/50" />

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={step.num}
                  className={`relative flex items-center transition-all duration-700 ${
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="sm:hidden flex items-start gap-5 w-full">
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full new-gradient-btn flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#9333EA]/25">
                      {step.num}
                    </div>
                    <div className="glass rounded-2xl p-5 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon size={20} className="text-[#A855F7]" />
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] gap-8 w-full items-center">
                    <div className={`${isLeft ? "" : "order-3"}`}>
                      <div
                        className={`glass rounded-2xl p-6 hover:border-[#9333EA]/30 transition-all hover:shadow-lg hover:shadow-[#9333EA]/10 ${
                          isLeft ? "text-right" : "text-left"
                        }`}
                      >
                        <div className={`flex items-center gap-3 mb-2 ${isLeft ? "justify-end" : "justify-start"}`}>
                          {!isLeft && <step.icon size={20} className="text-[#A855F7]" />}
                          <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                          {isLeft && <step.icon size={20} className="text-[#A855F7]" />}
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    <div className="relative z-10 w-14 h-14 rounded-full new-gradient-btn flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#9333EA]/25 order-2">
                      {step.num}
                    </div>

                    <div className={`${isLeft ? "order-3" : ""}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
