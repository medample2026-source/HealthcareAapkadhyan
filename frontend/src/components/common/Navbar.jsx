import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  changeGoogleLanguage,
  getSavedGoogleLanguage,
} from "../../utils/googleTranslate";
import { BRAND_LOGO_URL, BRAND_NAME } from "../../constants/brand";

const Navbar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [language, setLanguage] = useState(getSavedGoogleLanguage);

  const dashboardPath =
    user?.role === "doctor"
      ? "/doctor-dashboard"
      : user?.role === "hospitalAdmin"
        ? "/hospital-dashboard"
        : user?.role === "superAdmin"
          ? "/super-admin-dashboard"
          : user?.role === "medicalOwner"
            ? "/medical-dashboard"
            : "/patient-dashboard";

  const primaryLinks = [
    { name: "Home", path: "/" },
    { name: "Doctors", path: "/doctors" },
    { name: "Hospitals", path: "/hospitals" },
    { name: "Medicines", path: "/medicines" },
    { name: "Emergency SOS", path: "/emergency-sos" },
  ];

  const secondaryLinks = [
    { name: "Services", path: "/#services" },
    { name: "Partners", path: "/partners" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;

    setLanguage(selectedLanguage);
    changeGoogleLanguage(selectedLanguage);
  };

  const renderNavLink = (link, className, onClick) => {
    if (link.path.startsWith("/#")) {
      return (
        <a key={link.name} href={link.path} onClick={onClick} className={className}>
          {link.name}
        </a>
      );
    }

    return (
      <Link key={link.name} to={link.path} onClick={onClick} className={className}>
        {link.name}
      </Link>
    );
  };

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <img
              src={BRAND_LOGO_URL}
              alt={`${BRAND_NAME} Logo`}
              className="h-[3.25rem] w-[3.25rem] object-contain"
            />
          </div>

          <div>
            <h1
              className="notranslate text-2xl font-black text-slate-900"
              translate="no"
            >
              {BRAND_NAME}
            </h1>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-slate-100 bg-white/70 p-1 shadow-sm lg:flex">
          {primaryLinks.map((link) =>
            renderNavLink(
              link,
              "rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700",
            ),
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              More
              <ChevronDown
                size={16}
                className={`transition ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-cyan-100/50">
                {secondaryLinks.map((link) =>
                  renderNavLink(
                    link,
                    "block rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700",
                    () => setMoreOpen(false),
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>

          {user ? (
            <NavLink
              to={dashboardPath}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl bg-slate-100 p-2 lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden">
          <div className="flex flex-col gap-4">
            {[...primaryLinks, ...secondaryLinks].map((link) =>
              renderNavLink(
                link,
                "rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700",
                () => setOpen(false),
              ),
            )}

            <select
              value={language}
              onChange={handleLanguageChange}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>

            {user ? (
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-3 text-center font-semibold text-slate-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
