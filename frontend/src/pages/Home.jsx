import React from "react";
import LandingNav from "@/components/home/LandingNav";
import Hero from "@/components/home/Hero";
import PhoneStrip from "@/components/home/PhoneStrip";
import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";
import Faq from "@/components/home/Faq";
import ContactCTA from "@/components/home/ContactCTA";
import SiteFooter from "@/components/home/SiteFooter";
import StickyCta from "@/components/home/StickyCta";

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
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
          {[
            { label: "Kaufmann/-frau EFZ", emoji: "📊", color: "bg-[#FDFFB6]" },
            { label: "Elektroinstallateur/in EFZ", emoji: "⚡", color: "bg-[#FFD6A5]" },
            { label: "Fachfrau/-mann Gesundheit EFZ", emoji: "🩺", color: "bg-[#FFADAD]" },
            { label: "Informatiker/in EFZ", emoji: "💻", color: "bg-[#9BF6FF]" },
            { label: "Coiffeur/-euse EFZ", emoji: "✂️", color: "bg-[#BDB2FF]" },
            { label: "Logistiker/in EFZ", emoji: "📦", color: "bg-[#CAFFBF]" },
            { label: "Detailhandelsfachmann/-frau EFZ", emoji: "🛍️", color: "bg-[#FFD6A5]" },
            { label: "Theorieprüfung Auto (Kat. B)", emoji: "🚗", color: "bg-[#9BF6FF]" },
            { label: "+ dein Beruf", emoji: "🎓", color: "bg-white" },
          ].map((b) => (
            <span key={b.label} className={"border-2 border-black rounded-lg py-1.5 px-2 text-[10px] sm:rounded-full sm:px-4 sm:text-sm font-semibold flex items-center gap-1 justify-center " + b.color}>
              {b.emoji} {b.label}
            </span>
          ))}
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
