import {
  FiSearch,
  FiCheckCircle,
  FiCalendar,
  FiUpload,
  FiHeart,
} from "react-icons/fi";

const steps = [
  {
    id: 1,
    title: "Search",
    desc: "Find doctors or hospitals near you with smart filters.",
    icon: FiSearch,
  },
  {
    id: 2,
    title: "Check availability",
    desc: "Live slots, bed availability and emergency readiness.",
    icon: FiCheckCircle,
  },
  {
    id: 3,
    title: "Book instantly",
    desc: "Secure confirmation in under 30 seconds.",
    icon: FiCalendar,
  },
  {
    id: 4,
    title: "Upload reports",
    desc: "Share medical history with your provider securely.",
    icon: FiUpload,
  },
  {
    id: 5,
    title: "Receive care",
    desc: "In-person, video or emergency care — your way.",
    icon: FiHeart,
  },
];

const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
            How it works
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Find the right{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Specialist
            </span>
            <br className="hidden sm:block" /> without any wait.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.id} className="group text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl text-cyan-600 shadow-lg shadow-slate-200/70 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-cyan-200 group-hover:shadow-cyan-100">
                  <Icon />

                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-md">
                    {step.id}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-extrabold text-slate-950">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-[180px] text-sm leading-6 text-slate-500">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
