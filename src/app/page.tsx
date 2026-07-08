'use client';
import { useTheme } from './hooks/useTheme';
import { useScrollReveal } from './hooks/useScrollReveal';
import { useMagnetic } from './hooks/useMagnetic';
import { useTilt } from './hooks/useTilt';
import SharedNav from './components/SharedNav';
import MarketingFooter from './components/MarketingFooter';
import Hero from './components/home/Hero';
import HowItWorksSection from './components/home/HowItWorksSection';
import FeaturesSection from './components/home/FeaturesSection';
import GalleryPreviewSection from './components/home/GalleryPreviewSection';
import QuoteStatsSection from './components/home/QuoteStatsSection';
import ComparisonSection from './components/home/ComparisonSection';
import PricingPreviewSection from './components/home/PricingPreviewSection';
import FaqSection from './components/home/FaqSection';
import CtaSection from './components/home/CtaSection';
import './home.css';

export default function HomePage() {
  const [dark, setDark] = useTheme();

  useScrollReveal();
  useMagnetic();
  useTilt();

  return (
    <div style={{ backgroundColor: 'var(--paper)', backgroundImage: 'radial-gradient(var(--line) 1.1px, transparent 1.1px)', backgroundSize: '30px 30px', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', system-ui, sans-serif", minHeight: '100vh', overflowX: 'hidden', transition: 'background .6s cubic-bezier(.6,0,.2,1), color .6s cubic-bezier(.6,0,.2,1)', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>
      <SharedNav dark={dark} setDark={setDark} />
      <Hero />
      <HowItWorksSection />
      <FeaturesSection />
      <GalleryPreviewSection />
      <QuoteStatsSection />
      <ComparisonSection />
      <PricingPreviewSection />
      <FaqSection />
      <CtaSection />
      <MarketingFooter />
    </div>
  );
}
