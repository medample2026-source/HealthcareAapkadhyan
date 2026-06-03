import {
  FiShield,
  FiZap,
  FiBriefcase,
  FiHeadphones,
  FiRadio,
} from "react-icons/fi";
import { FaUserDoctor, FaHospital, FaBrain } from "react-icons/fa6";

const features = [
  {
    title: "Verified Doctors",
    desc: "Every credential audited and re-verified annually.",
    hoverDesc:
      "All doctors are manually verified with license checks, qualification validation, specialization review, and continuous re-verification.",
    icon: FiShield,
  },
  {
    title: "Trusted Hospitals",
    desc: "Partnered with verified and accredited institutions.",
    hoverDesc:
      "We collaborate with certified hospitals, emergency centers, and specialty care institutions with trusted infrastructure.",
    icon: FaHospital,
  },
  {
    title: "Instant Booking",
    desc: "Sub-30s confirmation. No phone tag.",
    hoverDesc:
      "Book appointments, emergency slots, consultations, or hospital beds instantly with real-time availability.",
    icon: FiZap,
  },
  {
    title: "Emergency Priority",
    desc: "Pre-authorized SOS routing to nearest ER.",
    hoverDesc:
      "Critical emergency requests are prioritized with rapid routing, nearest hospital suggestions, and quick response workflows.",
    icon: FiHeadphones,
  },
  {
    title: "Secure Reports",
    desc: "End-to-end encrypted vault for medical records.",
    hoverDesc:
      "Upload prescriptions, scans, reports, lab history, and treatment records securely with encrypted access control.",
    icon: FiBriefcase,
  },
  {
    title: "Fast Access",
    desc: "Quick platform response with smooth user experience.",
    hoverDesc:
      "Optimized architecture ensures rapid loading, smooth navigation, and real-time performance across devices.",
    icon: FaUserDoctor,
  },
  {
    title: "Real-time Updates",
    desc: "Live status across all care events.",
    hoverDesc:
      "Track appointment approvals, doctor availability, emergency responses, bed confirmation, and consultation progress.",
    icon: FiRadio,
  },
];

const WhyUs = () => {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-600">
            Why Choose Us
          </p>

          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Built for trust.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Engineered <br className="hidden sm:block" />
              for speed.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group h-[230px] [perspective:1000px]"
              >
                <div className="relative h-full w-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front Side */}
                  <div className="absolute inset-0 flex flex-col rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm [backface-visibility:hidden]">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-lg text-white shadow-md">
                      <Icon />
                    </div>

                    <h3 className="text-base font-extrabold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.desc}
                    </p>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 flex flex-col justify-center rounded-3xl border border-cyan-200 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-cyan-100 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-sm">
                      <Icon />
                    </div>

                    <h3 className="text-lg font-extrabold">{item.title}</h3>

                    <p className="mt-3 text-sm leading-6 text-white/90">
                      {item.hoverDesc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
