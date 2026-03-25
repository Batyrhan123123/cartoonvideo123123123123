import { useState } from "react";
import { useInView } from "@/hooks/useParallax";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  {
    name: "Ольга С.",
    avatar: "О",
    text: "Заказали видео для своего директора, видео получилось очень креативное и красивое, очень довольны сроками так как заказ был срочный — выполнили очень быстро и сдали в срок.",
    stars: 5,
  },
  {
    name: "Дмитрий К.",
    avatar: "Д",
    text: "Видео супер! Заказал для жены, сдали в срок. Рекомендую!",
    stars: 5,
  },
  {
    name: "Анна М.",
    avatar: "А",
    text: "Сдали в срок — это радует, так как заказ был большой и срочный, но ребята молодцы, справились!",
    stars: 5,
  },
  {
    name: "Игорь В.",
    avatar: "И",
    text: "Видео супер, закажем ещё на кызузату! Ребята молодцы, знают свою работу.",
    stars: 5,
  },
];

export default function ReviewsSection() {
  const [active, setActive] = useState(0);
  const { ref, isInView } = useInView();

  const prev = () => setActive((a) => (a === 0 ? reviews.length - 1 : a - 1));
  const next = () => setActive((a) => (a === reviews.length - 1 ? 0 : a + 1));

  return (
    <section id="reviews" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Отзывы</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Что говорят клиенты о работе с нами.
          </p>
        </div>

        {/* Review Card */}
        <div
          className={`relative max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative">
            <Quote size={48} className="text-purple-500/20 absolute top-6 left-6" />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: reviews[active].stars }).map((_, i) => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>

            {/* Text */}
            <p className="text-xl sm:text-2xl text-white/90 font-medium leading-relaxed mb-8 italic">
              &ldquo;{reviews[active].text}&rdquo;
            </p>

            {/* Avatar & Name */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-btn flex items-center justify-center text-white font-bold text-xl">
                {reviews[active].avatar}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">{reviews[active].name}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>

            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === active
                      ? "w-8 bg-gradient-to-r from-purple-500 to-pink-500"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}