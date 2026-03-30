import NewNavbar from "@/components/new/NewNavbar";
import NewHeroSection from "@/components/new/NewHeroSection";
import NewPortfolioSection from "@/components/new/NewPortfolioSection";
import NewServicesSection from "@/components/new/NewServicesSection";
import NewProcessSection from "@/components/new/NewProcessSection";
import NewReviewsSection from "@/components/new/NewReviewsSection";
import NewFaqContactFooter from "@/components/new/NewFaqContactFooter";
import { MessageCircle } from "lucide-react";

export default function NewIndex() {
  return (
    <div className="new-theme min-h-screen bg-[#0B0514] text-white overflow-x-hidden" style={{ fontFamily: "'Comfortaa', sans-serif" }}>
      <NewNavbar />
      <NewHeroSection />
      <NewPortfolioSection />
      <NewServicesSection />
      <NewProcessSection />
      <NewReviewsSection />
      <NewFaqContactFooter />

      <a
        href="https://wa.link/xwc2or"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30 transition-all hover:scale-110 animate-bounce-slow"
        aria-label="Написать в WhatsApp"
      >
        <MessageCircle size={30} className="text-white" />
      </a>
    </div>
  );
}
