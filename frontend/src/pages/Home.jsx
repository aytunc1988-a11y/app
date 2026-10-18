import React from "react";
import { Link } from "react-router-dom";
import LandingNav from "@/components/home/LandingNav";
import Hero from "@/components/home/Hero";
import PhoneStrip from "@/components/home/PhoneStrip";
import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";
import Faq from "@/components/home/Faq";
import ContactCTA from "@/components/home/ContactCTA";
import SiteFooter from "@/components/home/SiteFooter";
import StickyCta from "@/components/home/StickyCta";
import { PROFESSIONS } from "@/lib/subjects";

export default function Home() {
  return (
    <div className="modern-landing min-h-screen pb-20 md:pb-0">
      <LandingNav />
      <div className="max-w-[960px] mx-auto pb-8">
      {/* Berufe ganz oben */}
      <section className="py-8 px-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">JEDER BERUF WÄHLBAR</p>
        <h2 className="text-2xl font-black mb-1 leading-tight">Dein Beruf. Deine Prüfung.</h2>
        <p className="text-[#555] mb-4 text-sm">LAP QUIZ kennt deinen Lehrplan — wähle deinen Beruf und lege sofort los.</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {PROFESSIONS.map((profession) => (
            <Link
              key={profession.id}
              to={`/beruf/${profession.id}`}
              className={`modern-home-profession border-2 border-black rounded-lg py-2 px-2 text-[10px] sm:rounded-full sm:px-4 sm:text-sm font-semibold flex items-center gap-1 justify-center ${profession.bg}`}
            >
              {profession.emoji} {profession.name}
            </Link>
          ))}
          <Link
            to="/berufe"
            className="modern-home-profession border-2 border-black rounded-lg py-2 px-2 text-[10px] sm:rounded-full sm:px-4 sm:text-sm font-semibold flex items-center gap-1 justify-center bg-white"
          >
            🎓 + dein Beruf
          </Link>
        </div>
      </section>
        <Hero />
        <PhoneStrip />
        <HowItWorks />
        <div id="preise"><Pricing /></div>
        <Faq />
        <ContactCTA />
      </div>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
