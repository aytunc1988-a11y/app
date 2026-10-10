import React from "react";
import LandingNav from "@/components/home/LandingNav";
import Hero from "@/components/home/Hero";
import MiniDemo from "@/components/home/MiniDemo";
import PhoneStrip from "@/components/home/PhoneStrip";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Professions from "@/components/home/Professions";
import Pricing from "@/components/home/Pricing";
import Faq from "@/components/home/Faq";
import ContactCTA from "@/components/home/ContactCTA";
import SiteFooter from "@/components/home/SiteFooter";
import StickyCta from "@/components/home/StickyCta";

export default function Home() {
  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <LandingNav />
      <div className="max-w-[960px] mx-auto pb-8">
        <Hero />
        <MiniDemo />
        <PhoneStrip />
        <HowItWorks />
        <Features />
        <Professions />
        <div id="preise">
          <Pricing />
        </div>
        <Faq />
        <ContactCTA />
      </div>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
