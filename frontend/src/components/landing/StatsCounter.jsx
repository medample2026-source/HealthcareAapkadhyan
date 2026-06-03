import {
  ShieldCheck,
  Hospital,
  Stethoscope,
  HeartPulse,
  Users,
} from "lucide-react";

const stats = [
  {
    id: 1,
    value: "10,000+",
    label: "Patients Served",
    icon: Users,
    color: "text-cyan-400",
  },
  {
    id: 2,
    value: "500+",
    label: "Verified Doctors",
    icon: Stethoscope,
    color: "text-emerald-400",
  },
  {
    id: 3,
    value: "120+",
    label: "Partner Hospitals",
    icon: Hospital,
    color: "text-blue-400",
  },
  {
    id: 4,
    value: "24/7",
    label: "Emergency Support",
    icon: HeartPulse,
    color: "text-red-400",
  },
  {
    id: 5,
    value: "99.9%",
    label: "Data Security",
    icon: ShieldCheck,
    color: "text-violet-400",
  },
];

export default function StatsCounter() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 md:py-16 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className="group last:col-span-2 md:last:col-span-1 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 md:p-6 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-white/10"
              >
                <div
                  className={`mx-auto mb-3 sm:mb-4 flex h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 ${stat.color}`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
                  {stat.value}
                </h2>

                <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
