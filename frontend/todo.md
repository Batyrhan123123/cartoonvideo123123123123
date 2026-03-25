# CARTON Studio — Pixar-style Landing Page

## Design Guidelines

### Design References
- **Pixar.com**: Soft 3D aesthetics, warm lighting, playful yet professional
- **Apple.com**: Clean sections, smooth scroll animations
- **Style**: Pixar 3D + Glassmorphism + Soft Gradients

### Color Palette
- Background: #0F0B1E (Deep Purple-Black)
- Surface: #1A1530 (Dark Purple)
- Card: rgba(255,255,255,0.05) (Glass)
- Accent Primary: #8B5CF6 (Vivid Purple)
- Accent Secondary: #EC4899 (Pink)
- Accent Tertiary: #06B6D4 (Cyan)
- Text Primary: #FFFFFF
- Text Secondary: #A78BFA (Light Purple)
- Gradient: linear-gradient(135deg, #8B5CF6, #EC4899)

### Typography
- Font: Plus Jakarta Sans (Google Fonts)
- H1: 700, 56px (desktop) / 36px (mobile)
- H2: 700, 40px / 28px
- H3: 600, 24px / 20px
- Body: 400, 16px / 14px

### Key Component Styles
- Cards: Glassmorphism (backdrop-blur, semi-transparent bg, subtle border)
- Buttons: Gradient bg (purple→pink), white text, rounded-full, hover scale
- Sections: Full-width, generous padding (96px vertical)
- Animations: Parallax on scroll, fade-in-up on intersection

## Files to Create

1. **src/pages/Index.tsx** — Main landing page composing all sections
2. **src/components/Navbar.tsx** — Fixed top navigation with smooth scroll links
3. **src/components/HeroSection.tsx** — Hero with parallax, title, CTA buttons, badges
4. **src/components/PortfolioSection.tsx** — Video grid with category filter, video placeholders
5. **src/components/ServicesSection.tsx** — 6 service cards with icons
6. **src/components/ProcessSection.tsx** — 5-step timeline
7. **src/components/ReviewsSection.tsx** — Testimonial carousel
8. **src/components/FaqContactFooter.tsx** — FAQ accordion + Contacts + Footer combined

## Images
- hero-pixar-scene.jpg (CDN)
- services-storyboard.jpg (CDN)
- portfolio-love-story.jpg (CDN)
- bg-abstract-pixar.jpg (CDN)