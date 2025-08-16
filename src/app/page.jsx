"use client";

import NavBar from "../components/landing/NavBar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Plans from "../components/landing/Plans";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export const metadata = {
  title: "BitBima - Decentralized Health Insurance - Watch your health, guard your wealth.",
  description: "Instant claims, lower costs, and transparent on-chain health insurance.",
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <NavBar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Plans />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
