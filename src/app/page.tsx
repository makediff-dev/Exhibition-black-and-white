import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { HomeHero } from "@/components/home/home-hero";
import { HomeCategoriesSection } from "@/components/home/home-categories-section";
import { HomeQuickActionsSection } from "@/components/home/home-quick-actions-section";
import { HomeEventsSection } from "@/components/home/home-events-section";
import { HomeOrdersProvider } from "@/components/home/home-orders-provider";
import { HomeUrgentOrdersSection } from "@/components/home/home-urgent-orders-section";
import { HomeCategoryOrdersSection } from "@/components/home/home-category-orders-section";
import { HomeRecommendedServicesSection } from "@/components/home/home-recommended-services-section";
import { HomeRecommendedContractorsSection } from "@/components/home/home-recommended-contractors-section";
import { HomeContractorsCategorySection } from "@/components/home/home-contractors-category-section";
import { HomeRecommendedVenuesSection } from "@/components/home/home-recommended-venues-section";
import { HomeMoscowVenuesSection } from "@/components/home/home-moscow-venues-section";
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
        <HomeCategoriesSection />
        <HomeQuickActionsSection />
        <HomeEventsSection />

        <HomeOrdersProvider>
          <HomeUrgentOrdersSection />
          <HomeCategoryOrdersSection
            categoryIndex={0}
            linkHref="/requests"
            linkLabel="Все заказы"
          />
          <HomeCategoryOrdersSection
            categoryIndex={1}
            linkHref="/requests"
            linkLabel="Все заказы"
          />
          <HomeCategoryOrdersSection
            categoryIndex={2}
            linkHref="/requests"
            linkLabel="Все заказы"
          />
          <HomeRecommendedServicesSection />
          <HomeRecommendedContractorsSection />
          <HomeContractorsCategorySection
            title="Комплексное строительство выставочных стендов"
            category="Комплексное строительство выставочных стендов"
            idSuffix="build"
          />
          <HomeContractorsCategorySection
            title="Дизайн-проект выставочного стенда"
            category="Дизайн-проект выставочного стенда"
            idSuffix="design"
          />
        </HomeOrdersProvider>

        <HomeRecommendedVenuesSection />
        <HomeMoscowVenuesSection />
        <HomeAudienceSection />
        <HomeHowItWorksSection />
        <HomeFaqSection />
        <HomeCtaSection />
      </main>
      <Footer />
    </div>
  );
}