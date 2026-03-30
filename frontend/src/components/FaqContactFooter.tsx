import { useState } from "react";
import { useInView } from "@/hooks/useParallax";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageCircle,
  ArrowUp,
  Send,
  User,
  Phone,
  FileText,
  AlertCircle,
} from "lucide-react";

const faqItems = [
  {
    q: "Сколько времени занимает производство?",
    a: "Обычно 1–3 дней для ролика. Точные сроки зависят от сложности и загрузки студии — обсудим после брифа.",
  },
  {
    q: "В каком формате отдаёте готовый ролик?",
    a: "Мы отдаём ролик в формате MP4 (H.264/H.265) в разрешении 4K. По запросу можем предоставить в других форматах.",
  },
  {
    q: "Можно ли использовать своих персонажей или логотип?",
    a: "Да, мы можем интегрировать ваших персонажей, логотип и фирменный стиль в анимацию.",
  },
  {
    q: "Как проходит согласование?",
    a: "На каждом этапе мы показываем промежуточные результаты: сценарий, раскадровку, черновую анимацию. Правки включены.",
  },
];

const navLinks = [
  { label: "Работы", href: "#portfolio" },
  { label: "Услуги", href: "#services" },
  { label: "Процесс", href: "#process" },
  { label: "Отзывы", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Контакты", href: "#contacts" },
];

type LeadApiResponse = {
  success?: boolean;
  message?: string;
  detail?: string;
  lead_id?: number | null;
  contact_id?: number | null;
};

export default function FaqContactFooter() {
  const { ref: faqRef, isInView: faqInView } = useInView();
  const { ref: contactRef, isInView: contactInView } = useInView();

  const [formData, setFormData] = useState({ name: "", phone: "", topic: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const topic = formData.topic.trim();

    if (!name || !phone) {
      setErrorMessage("Пожалуйста, заполните имя и телефон.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    const payload = { name, phone, topic };

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [3000, 5000, 7000];
    let lastError: unknown = null;

    try {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 1) {
            setStatusMessage(
              `Подключаемся к серверу... (попытка ${attempt}/${MAX_RETRIES})`
            );
          }

          // Always call backend via the current site origin.
          // This avoids cases where runtime config points to an unreachable lambda-url domain.
          const endpoint = new URL(
            "/api/v1/amocrm/create-lead",
            window.location.origin
          ).toString();

          console.log(
            `[CARTOON] Attempt ${attempt}/${MAX_RETRIES} — sending lead via fetch`
          );

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const contentType = response.headers.get("content-type") || "";
          const rawText = await response.text();

          console.log("[CARTOON] status:", response.status);
          console.log("[CARTOON] content-type:", contentType);
          console.log("[CARTOON] raw response:", rawText);

          if (!contentType.includes("application/json")) {
            throw new Error(`Non-JSON response: ${response.status}`);
          }

          let result: LeadApiResponse;
          try {
            result = JSON.parse(rawText);
          } catch {
            throw new Error("Invalid JSON response");
          }

          if (result?.success) {
            setStatusMessage("");
            setFormSubmitted(true);
            setFormData({ name: "", phone: "", topic: "" });
            setTimeout(() => setFormSubmitted(false), 5000);
            return;
          }

          if (result?.message) {
            setStatusMessage("");
            setErrorMessage(result.message);
            return;
          }

          if (result?.detail) {
            setStatusMessage("");
            setErrorMessage(result.detail);
            return;
          }

          throw new Error("Unexpected response format");
        } catch (err: unknown) {
          lastError = err;
          const errMsg = err instanceof Error ? err.message : String(err);

          console.warn(`[CARTOON] Attempt ${attempt} failed:`, errMsg);

          const isTransient =
            errMsg.includes("dns") ||
            errMsg.includes("balancer") ||
            errMsg.includes("timeout") ||
            errMsg.includes("503") ||
            errMsg.includes("network") ||
            errMsg.includes("ECONNREFUSED") ||
            errMsg.includes("Failed to fetch") ||
            errMsg.includes("Non-JSON response");

          if (isTransient && attempt < MAX_RETRIES) {
            const delay = RETRY_DELAYS[attempt - 1] || 5000;
            setStatusMessage(
              `Сервер запускается... Повторная попытка через ${Math.round(
                delay / 1000
              )} сек.`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw err;
        }
      }
    } catch (err: unknown) {
      console.error("[CARTOON] Final submit error:", err);

      const maybeApiError = err as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };

      if (maybeApiError?.response?.data?.detail) {
        setErrorMessage(maybeApiError.response.data.detail);
      } else if (maybeApiError?.response?.data?.message) {
        setErrorMessage(maybeApiError.response.data.message);
      } else {
        setErrorMessage(
          "Не удалось отправить заявку. Попробуйте ещё раз или напишите в WhatsApp."
        );
      }
    } finally {
      setStatusMessage("");
      setIsSubmitting(false);

      if (lastError) {
        console.error("[CARTOON] Last error:", lastError);
      }
    }
  };

  return (
    <>
      <section id="faq" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-[150px]" />

        <div
          ref={faqRef}
          className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              faqInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              <span className="gradient-text">FAQ</span>
            </h2>
            <p className="text-white/50 text-lg">
              Частые вопросы о производстве и сроках.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              faqInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="glass rounded-2xl px-6 border-white/10 data-[state=open]:border-purple-500/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-white hover:text-purple-300 py-5 text-base font-medium hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/50 pb-5 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section id="contacts" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />

        <div
          ref={contactRef}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              contactInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              <span className="gradient-text">Контакты</span>
            </h2>
            <p className="text-white/50 text-lg">
              Оставьте заявку или напишите в WhatsApp — ответим в течение дня.
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${
              contactInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="glass-strong rounded-3xl p-8 sm:p-10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Send size={20} className="text-purple-400" />
                Оставить заявку
              </h3>

              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full gradient-btn flex items-center justify-center mx-auto mb-4">
                    <Send size={28} className="text-white" />
                  </div>
                  <p className="text-xl font-semibold text-white mb-2">
                    Заявка отправлена!
                  </p>
                  <p className="text-white/50">
                    Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                      <User size={14} />
                      Имя
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ваше имя"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                      <Phone size={14} />
                      Номер телефона
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+7 (___) ___-__-__"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  {statusMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      <p className="text-sm text-blue-300">{statusMessage}</p>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl gradient-btn text-white font-semibold text-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Отправка..."
                      : errorMessage
                      ? "Попробовать ещё раз"
                      : "Отправить заявку"}
                  </button>
                </form>
              )}
            </div>

            <div className="glass-strong rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <MessageCircle size={36} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Или напишите в WhatsApp
              </h3>
              <p className="text-white/50 mb-8">
                Быстрый ответ, обсудим задачу и сроки.
              </p>
              <a
                href="https://wa.link/xwc2or"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/25"
              >
                <MessageCircle size={24} />
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 items-start">
            <div>
              <div className="text-2xl font-extrabold gradient-text mb-3">
                CARTOON
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Персональные мультфильмы по вашим фото и воспоминаниям. Подари лучшие эмоции своим близким.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                Навигация
              </h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="block text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                Контакты
              </h4>
              <div className="space-y-2">
                <a
                  href="https://wa.link/xwc2or"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-white/40 hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">
              © 2026 CARTOON. Все права защищены.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110"
            >
              <ArrowUp size={18} className="text-white/50" />
            </button>
          </div>
        </div>
      </footer>
    </> 
  );
}