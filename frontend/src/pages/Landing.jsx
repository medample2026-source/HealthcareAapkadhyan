import { Link } from "react-router-dom";
import { Siren } from "lucide-react";

import EmergencySection from "../components/landing/EmergencySection";
import HealthcareServices from "../components/landing/HealthcareServices";
import HospitalAvailability from "../components/landing/HospitalAvailability";
import HowItWorks from "../components/landing/HowItWorks";
import PremiumCarousel from "../components/landing/PremiumCarousel";
import StatsCounter from "../components/landing/StatsCounter";
import Testimonials from "../components/landing/Testimonials";
import TopDoctors from "../components/landing/TopDoctors";
import WhyUs from "../components/landing/WhyUs";

const Landing = () => {
  return (
    <div className="relative">
      <PremiumCarousel />
      <StatsCounter />
      <HealthcareServices />
      <HowItWorks />
      <WhyUs />
      <TopDoctors />
      <HospitalAvailability />
      <Testimonials />
      <EmergencySection />

      <Link
        to="/emergency-sos"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-5 py-4 text-sm font-black text-white shadow-2xl shadow-red-300 transition hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-red-500 opacity-40 blur-xl" />
        <span className="relative flex items-center gap-2">
          <Siren size={20} />
          SOS
        </span>
      </Link>
    </div>
  );
};

export default Landing;
