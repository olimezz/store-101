import React, { Suspense } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TireFinderBar } from "@/components/TireFinderBar";
import { CatalogSection } from "@/components/CatalogSection";
import { TrustSection } from "@/components/TrustSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { MobileStickyCartBar } from "@/components/MobileStickyCartBar";
import { CheckoutCancelledNotice } from "@/components/CheckoutCancelledNotice";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <CheckoutCancelledNotice />
      </Suspense>
      <HeroSection />
      <TireFinderBar />
      <CatalogSection />
      <TrustSection />
      <NewsletterSection />
      <MobileStickyCartBar />
    </>
  );
}
