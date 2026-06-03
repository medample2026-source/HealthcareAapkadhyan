import {
  FiBell,
  FiPhoneCall,
  FiShield,
  FiArrowRight,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import NearbyHealthcare from "../landing/NearbyHealthcare";

const quickFeatures = [
  { title: "Live ETA", icon: FiClock },
  { title: "Profile Sharing", icon: FiShield },
  { title: "ER Alert", icon: FiBell },
];

const EmergencySection = () => {
  return (
    <section
      id="emergency"
      className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 px-6 py-10 shadow-2xl shadow-red-200 sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-black/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                Live Emergency Network
              </div>

              <h2 className="max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                Every second matters. We're built for them.
              </h2>

              <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-white/90 sm:text-base">
                One tap alerts emergency care and shows nearby hospitals,
                clinics, doctors and medical stores live on the map.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {quickFeatures.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/15"
                    >
                      <Icon />
                      {item.title}
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-red-600 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <FiBell />
                  Activate SOS
                  <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/25">
                  <FiPhoneCall />
                  Call 108
                </button>
              </div>
            </div>

            <div>
              <NearbyHealthcare emergencyTheme={true} />

              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10">
                <FiMapPin />
                Click “Find Nearby” to detect live hospitals, clinics, doctors
                and medical stores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencySection;
