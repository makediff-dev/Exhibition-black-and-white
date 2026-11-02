import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { HomeHero } from "@/components/home/home-hero";
import { HomePromoSlider } from "@/components/home/home-promo-slider";
import { HomeMain } from "@/components/home/home-main";
import { HomeAudienceSection } from "@/components/home/home-audience-section";
import { HomeHowItWorksSection } from "@/components/home/home-how-it-works-section";
import { HomeFaqSection } from "@/components/home/home-faq-section";
import { HomeCtaSection } from "@/components/home/home-cta-section";
import styles from "@/components/home/home-page.module.css";

export default function HomePage() {
  return (
    <div className={`flex flex-col min-h-screen ${styles.page}`}>
      <PublicHeader />
      <main>
        <HomeHero />
        <HomePromoSlider />
        <HomeMain />
        <HomeAudienceSection />
        <HomeHowItWorksSection />
        <HomeFaqSection />
        <HomeCtaSection />
      </main>
      <Footer />
    </div>
  );
}
