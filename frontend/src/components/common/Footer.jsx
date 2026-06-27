import {
  FiArrowRight,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { Ambulance, HeartPulse, ShieldCheck } from "lucide-react";
import { BRAND_LOGO_URL, BRAND_NAME } from "../../constants/brand";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Find Doctors", path: "/doctors" },
      { label: "Find Hospitals", path: "/hospitals" },
      { label: "Find Medicines", path: "/medicines" },
      { label: "Emergency SOS", path: "/emergency-sos" },
    ],
  },
  {
    title: "For Users",
    links: [
      { label: "Patient Login", path: "/login" },
      { label: "Create Account", path: "/register" },
      { label: "Book Appointment", path: "/doctors" },
      { label: "Medical Reports", path: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Partner With Us", path: "/partners" },
      { label: "Contact", path: "/contact" },
      { label: "Testimonials", path: "/#testimonials" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Verified Doctors", path: "/doctors" },
      { label: "Approved Hospitals", path: "/hospitals" },
      { label: "Secure Access", path: "/login" },
      { label: "Support", path: "/contact" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-cyan-900/30">
                <img
                  src={BRAND_LOGO_URL}
                  alt={`${BRAND_NAME} Logo`}
                  className="h-[4.5rem] w-[4.5rem] object-contain"
                />
              </div>

              <div>
                <h2 className="notranslate text-3xl font-black" translate="no">
                  {BRAND_NAME}
                </h2>
                <p className="text-xs font-semibold text-cyan-200">
                  Smart Healthcare Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              <span className="notranslate" translate="no">
                {BRAND_NAME}
              </span>{" "}
              connects patients, doctors, hospitals, medical
              stores, emergency support, reports, and healthcare partners in one
              secure digital ecosystem.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <ContactLine icon={<FiMail />} text="support@medample.com" />
              <ContactLine icon={<FiPhone />} text="+91 98765 43210" />
              <ContactLine
                icon={<FiMapPin />}
                text="Bhopal, Madhya Pradesh, India"
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/emergency-sos"
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700"
              >
                <Ambulance size={18} />
                Emergency SOS
              </Link>

              <Link
                to="/partners"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-white/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-white/15"
              >
                Partner With Us
                <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-black uppercase tracking-wide text-cyan-200">
                  {column.title}
                </h3>

                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.path.includes("#") ? (
                        <a
                          href={link.path}
                          className="text-sm font-semibold text-slate-300 transition hover:text-white"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.path}
                          className="text-sm font-semibold text-slate-300 transition hover:text-white"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-5 md:grid-cols-3">
          <TrustCard
            icon={<ShieldCheck />}
            title="Verified Network"
            text="Doctors, hospital admins, and medical owners go through admin approval before access."
          />
          <TrustCard
            icon={<HeartPulse />}
            title="Patient First"
            text="Appointments, reports, emergency help, and medicine requests are built around patient convenience."
          />
          <TrustCard
            icon={<Ambulance />}
            title="Emergency Ready"
            text="Public and patient SOS flows help emergency requests reach platform and hospital teams."
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-300">
              Copyright 2026{" "}
              <span className="notranslate" translate="no">
                {BRAND_NAME}
              </span>{" "}
              Health Technologies. All rights
              reserved.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Healthcare information on this platform is for service access and
              coordination. In emergencies, contact local medical services.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SocialLink label="Twitter" icon={<FiTwitter />} />
            <SocialLink label="LinkedIn" icon={<FiLinkedin />} />
            <SocialLink label="GitHub" icon={<FiGithub />} />
          </div>
        </div>
      </div>
    </footer>
  );
};

const ContactLine = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-cyan-300">{icon}</span>
      <span>{text}</span>
    </div>
  );
};

const TrustCard = ({ icon, title, text }) => {
  return (
    <div className="rounded-3xl bg-slate-950/60 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
};

const SocialLink = ({ icon, label }) => {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:border-cyan-300 hover:text-cyan-200"
    >
      {icon}
    </a>
  );
};

export default Footer;
