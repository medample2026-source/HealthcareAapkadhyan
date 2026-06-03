import { useEffect, useRef, useState } from "react";
import {
  FaUserDoctor,
  FaBedPulse,
  FaTruckMedical,
  FaHospital,
  FaUserNurse,
  FaFileMedical,
  FaVideo,
  FaBell,
  FaPrescriptionBottleMedical,
  FaQrcode,
  FaArrowRight,
} from "react-icons/fa6";

const services = [
  {
    title: "Emergency QR Profile",
    description: "Instant patient details for emergency care.",
    icon: FaQrcode,
    color: "from-fuchsia-500 to-purple-400",
  },
  {
    title: "Emergency SOS",
    description: "One-tap dispatch to the nearest emergency unit.",
    icon: FaTruckMedical,
    color: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Appointments",
    description: "Real-time scheduling with verified specialists.",
    icon: FaUserDoctor,
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Specialist Discovery",
    description: "Smart specialist search for better treatment.",
    icon: FaUserNurse,
    color: "from-indigo-500 to-blue-400",
  },
  {
    title: "Nearby Hospitals",
    description: "Geo-aware discovery with routing and ETA.",
    icon: FaHospital,
    color: "from-purple-500 to-pink-400",
  },
  {
    title: "Medical Reports",
    description: "Secure vault for labs, scans and prescriptions.",
    icon: FaFileMedical,
    color: "from-amber-500 to-yellow-400",
  },
  {
    title: "Health Alerts",
    description: "Smart reminders for medicines and follow-ups.",
    icon: FaBell,
    color: "from-rose-500 to-red-400",
  },
  {
    title: "Prescriptions",
    description: "Digital prescriptions synced safely.",
    icon: FaPrescriptionBottleMedical,
    color: "from-sky-500 to-blue-400",
  },
];

const HealthcareServices = () => {
  const [visibleItems, setVisibleItems] = useState({});
  const sectionRef = useRef(null);

  useEffect(() => {
    const elements = sectionRef.current?.querySelectorAll("[data-animate]");
    if (!elements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.animate;

          if (entry.isIntersecting && id) {
            setVisibleItems((prev) => ({
              ...prev,
              [id]: true,
            }));
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-14 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-200 opacity-60 blur-3xl sm:h-80 sm:w-80" />
        <div className="animate-blob animation-delay-2000 absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-purple-200 opacity-60 blur-3xl sm:h-80 sm:w-80" />
        <div className="animate-blob animation-delay-4000 absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 opacity-50 blur-3xl sm:h-80 sm:w-80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          data-animate="header"
          className={`mx-auto mb-12 max-w-4xl text-center transition-all duration-1000 sm:mb-16 ${
            visibleItems.header
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <span className="mb-4 inline-flex rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm backdrop-blur-md">
            Smart Healthcare Platform
          </span>

          <h2 className="bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-700 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Core Services
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg md:text-xl">
            Everything healthcare needs in one secure platform connecting
            patients, doctors and hospitals.
          </p>

          <div className="mx-auto mt-7 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service, index) => {
            const Icon = service.icon;
            const id = `service-${index}`;

            return (
              <article
                key={service.title}
                data-animate={id}
                style={{ transitionDelay: `${index * 70}ms` }}
                className={`group relative transition-all duration-700 ${
                  visibleItems[id]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-6">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  <div
                    className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${service.color} text-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon />
                  </div>

                  <h3 className="relative mb-2 text-lg font-bold text-slate-900 transition-colors duration-300 group-hover:text-blue-600">
                    {service.title}
                  </h3>

                  <p className="relative text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <div className="relative mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Learn more
                    <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </article>
            );
          })}
        </div>

        <div
          data-animate="footer"
          className={`mt-14 flex justify-center transition-all delay-300 duration-1000 sm:mt-20 ${
            visibleItems.footer
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <button className="group inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            Explore our all services
            <FaArrowRight className="text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HealthcareServices;
