import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Работы", href: "#portfolio" },
  { label: "Услуги", href: "#services" },
  { label: "Процесс", href: "#process" },
  { label: "Отзывы", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Контакты", href: "#contacts" },
];

export default function NewNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg shadow-[#9333EA]/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center cursor-pointer"
        >
          <img src="/logo-transparent.png" alt="C" className="w-[3.5rem] h-[3.5rem] object-contain" />
          <span className="-ml-2.5 text-3xl font-semibold tracking-wide bg-gradient-to-r from-[#7DD3FC] via-[#C4B5FD] to-[#A78BFA] bg-clip-text text-transparent leading-none" style={{ fontFamily: "'Fredoka', sans-serif" }}>artoon</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleClick("#contacts")}
            className="ml-3 px-6 py-2.5 text-sm font-semibold text-white rounded-full new-gradient-btn transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#9333EA]/25"
          >
            Заказать проект
          </button>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass-strong mx-4 mt-3 rounded-2xl p-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleClick("#contacts")}
            className="w-full mt-2 px-6 py-3 text-sm font-semibold text-white rounded-full new-gradient-btn"
          >
            Заказать проект
          </button>
        </div>
      </div>
    </nav>
  );
}
