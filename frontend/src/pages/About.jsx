import { motion } from "framer-motion";
import {
  HeartPulse,
  Target,
  Eye,
  ShieldCheck,
  Stethoscope,
  Hospital,
  MapPin,
  FileText,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code2,
  Mail,
  LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const objectives = [
  "Make healthcare access faster, easier, and more reliable.",
  "Help patients find doctors, hospitals, emergency care, and medical support in one place.",
  "Store and manage medical reports securely through patient identity.",
  "Support emergency situations with SOS, location, and nearby healthcare assistance.",
  "Build a platform that works for cities, towns, and rural areas.",
];

const values = [
  {
    title: "Trust",
    desc: "We focus on verified healthcare support, secure records, and reliable information.",
    icon: ShieldCheck,
  },
  {
    title: "Care",
    desc: "Every feature is designed around patients, families, and real emergency needs.",
    icon: HeartPulse,
  },
  {
    title: "Speed",
    desc: "From appointment booking to SOS support, we want healthcare actions to happen quickly.",
    icon: PhoneCall,
  },
  {
    title: "Access",
    desc: "MedAmple is built for everyone, including people in smaller cities and rural areas.",
    icon: MapPin,
  },
];

const features = [
  {
    title: "Doctor Appointments",
    icon: Stethoscope,
  },
  {
    title: "Hospital Availability",
    icon: Hospital,
  },
  {
    title: "Emergency SOS",
    icon: PhoneCall,
  },
  {
    title: "Medical Reports",
    icon: FileText,
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Frontend Developer",
    role: "Er. Devesh Pathak",
    desc: "Works on responsive interfaces, smooth animations, reusable components, and user-friendly healthcare screens.",
    image:
      "https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1780429369/healthcare/profile-images/patients/PAT-2026-167968/lblkzekn1bdocig03e4v.jpg",
  },
  {
    id: 2,
    name: "Backend Developer",
    role: "Er. Deepanshu Pandey",
    desc: "Handles secure APIs, authentication, database models, role-based access, and backend performance.",
    image:
      "https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1780428803/healthcare/profile-images/doctors/6a188986920e41a45aec3afa/zskakihbqyapoxupjjid.jpg",
  },
  {
    id: 3,
    name: "Full Stack Developer",
    role: "Er. Harsh Mishra",
    desc: "Connects frontend, backend, dashboards, reports, emergency modules, and overall product workflow.",
    image:
      "https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1780432420/WhatsApp_Image_2026-06-03_at_2.02.37_AM_xgji6k.jpg",
  },
];

const journey = [
  {
    year: "Step 01",
    title: "Problem Identification",
    desc: "We noticed that patients often struggle to find the right doctor, hospital, report, or emergency help at the right time.",
  },
  {
    year: "Step 02",
    title: "Platform Planning",
    desc: "We planned a complete healthcare ecosystem with patients, doctors, hospitals, reports, appointments, and SOS support.",
  },
  {
    year: "Step 03",
    title: "Product Development",
    desc: "We started building MedAmple with modern web technologies, secure authentication, dashboards, and clean user experience.",
  },
  {
    year: "Step 04",
    title: "Future Vision",
    desc: "Our goal is to add real-time emergency tracking, AI health support, hospital integrations, and smarter healthcare analytics.",
  },
];

const About = () => {
  return (
    <main className="overflow-hidden bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-5 pb-20 pt-28">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-700 shadow-sm"
            >
              <HeartPulse size={15} />
              About MedAmple
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Our story is about making{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                healthcare simpler
              </span>{" "}
              for every family.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg"
            >
              MedAmple is a smart healthcare platform created to connect
              patients, doctors, hospitals, reports, and emergency help in one
              trusted digital space.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-1 hover:bg-slate-800"
              >
                Contact Us
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/#services"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-white px-7 py-3 text-sm font-semibold text-cyan-700 shadow-sm transition hover:-translate-y-1 hover:bg-cyan-50"
              >
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-white to-cyan-50 p-8 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Who We Are
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              A healthcare platform built with care, technology, and purpose.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              We started MedAmple with a simple thought: healthcare should not
              feel confusing when someone needs help. Many people face problems
              while finding doctors, checking hospital availability, managing
              reports, or getting emergency support.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              MedAmple is our effort to bring these important healthcare needs
              into one clean and secure platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Connected inside one healthcare ecosystem.
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* OBJECTIVE */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Our Objective
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Our goal is to reduce the gap between{" "}
              <span className="text-blue-600">people and healthcare.</span>
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              We want MedAmple to become a helpful digital companion for
              patients, families, doctors, and hospitals.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <ul className="space-y-5">
              {objectives.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  className="flex gap-4 rounded-2xl bg-slate-50 p-4"
                >
                  <CheckCircle2 className="mt-1 shrink-0 text-emerald-500" />
                  <span className="text-sm leading-7 text-slate-600">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* MISSION VISION */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Mission & Vision
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              What drives MedAmple forward.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-cyan-100 bg-cyan-50/60 p-8"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                <Target size={27} />
              </div>

              <h3 className="text-2xl font-black text-slate-950">
                Our Mission
              </h3>

              <p className="mt-4 leading-8 text-slate-600">
                To create a healthcare platform where patients can easily find
                doctors, hospitals, reports, appointments, and emergency help
                without unnecessary confusion or delay.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-8"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Eye size={27} />
              </div>

              <h3 className="text-2xl font-black text-slate-950">Our Vision</h3>

              <p className="mt-4 leading-8 text-slate-600">
                To become a trusted digital healthcare ecosystem that supports
                families, hospitals, and doctors with secure technology,
                real-time access, and emergency-ready features.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
                Our Values
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                The principles behind our work.
              </h2>
            </div>

            <p className="max-w-xl leading-8 text-slate-600">
              Every decision at MedAmple is based on real healthcare needs,
              user trust, and simple digital access.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  variants={fadeUp}
                  className="rounded-[1.7rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-xl font-black text-slate-950">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {value.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Our Journey
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              From an idea to a healthcare ecosystem.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {journey.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative rounded-[1.7rem] border border-slate-100 bg-slate-50 p-7"
              >
                <div className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-cyan-600 shadow-sm">
                  {item.year}
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      {/* FOUNDER */}
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Founder & Owner
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              The vision behind MedAmple.
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              MedAmple was founded with a clear purpose: to make healthcare
              access simpler, faster, safer, and more connected for every
              family.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-cyan-100/50 lg:grid-cols-[0.9fr_1.1fr]"
          >
            {/* Owner Image */}
            <div className="relative min-h-[360px] overflow-hidden bg-cyan-100">
              <img
                src="https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1780432501/ChatGPT_Image_Jun_3_2026_02_04_45_AM_efjvax.png"
                alt="Founder and owner of MedAmple"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 px-5 py-4 shadow-lg backdrop-blur-md">
                <h3 className="text-xl font-black text-slate-950">
                  Founder & Owner
                </h3>
                <p className="mt-1 text-sm font-semibold text-cyan-600">
                  Mr. Shivam Shrivastava
                </p>
              </div>
            </div>

            {/* Owner Details */}
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
                <HeartPulse size={15} />
                Leading Healthcare With Purpose
              </div>

              <h3 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Building a healthcare platform that supports people before,
                during, and after medical needs.
              </h3>

              <p className="mt-5 leading-8 text-slate-600">
                The founder and owner of MedAmple started this platform with
                the belief that healthcare should not feel complicated when
                people need help the most. The idea behind MedAmple is to
                bring patients, doctors, hospitals, medical reports,
                appointments, and emergency support into one trusted digital
                ecosystem.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                The owner’s vision is to create a platform that can help
                families find reliable healthcare support, manage important
                medical information, and respond faster during emergency
                situations. MedAmple is being built with a strong focus on
                trust, accessibility, security, and real-world healthcare
                problems.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  "Healthcare Innovation",
                  "Patient-Centered Vision",
                  "Emergency Support Focus",
                  "Secure Digital Health Access",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
                  >
                    <CheckCircle2
                      className="shrink-0 text-emerald-500"
                      size={20}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-slate-800"
                >
                  Contact Team
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/#services"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 transition hover:-translate-y-1 hover:bg-cyan-50"
                >
                  View Platform
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
                Development Team
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                The developers behind MedAmple.
              </h2>
            </div>

            <p className="max-w-xl leading-8 text-slate-600">
              A small focused development team working on design, frontend,
              backend, security, dashboards, reports, and emergency features.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 md:grid-cols-3"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                variants={fadeUp}
                className="group rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-2 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white"
                  />

                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan-600">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {member.desc}
                </p>

                <div className="mt-5 flex gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-cyan-500 hover:text-white">
                    <LinkIcon size={15} />
                  </button>

                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-950 hover:text-white">
                    <Code2 size={15} />
                  </button>

                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-emerald-500 hover:text-white">
                    <Mail size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white px-5 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 p-8 text-center text-white shadow-2xl shadow-cyan-100 sm:p-14"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <Sparkles size={28} />
          </div>

          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            We are building healthcare that feels closer, faster, and more
            trustworthy.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-cyan-50 sm:text-base">
            MedAmple is our step toward a better healthcare experience for
            patients, families, doctors, and hospitals.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-blue-600 transition hover:-translate-y-1 hover:bg-slate-50"
            >
              Join MedAmple
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/20"
            >
              Contact Team
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default About;
