import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PortfolioSection from "@/components/PortfolioSection";
import ServicesSection from "@/components/ServicesSection";
import ProcessSection from "@/components/ProcessSection";
import ReviewsSection from "@/components/ReviewsSection";
import FaqContactFooter from "@/components/FaqContactFooter";
import { MessageCircle } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0F0B1E] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <PortfolioSection />
      <ServicesSection />
      <ProcessSection />
      <ReviewsSection />
      <FaqContactFooter />

      {/* Fixed WhatsApp Button */}
      <a
        href="https://wa.me/"
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