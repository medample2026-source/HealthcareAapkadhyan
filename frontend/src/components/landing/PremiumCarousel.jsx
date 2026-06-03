import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
   {
    id: 1,
    image:
      "https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1779608331/ChatGPT_Image_May_24_2026_01_06_01_PM_r3qgcz.png",
    title: "Trusted Family Healthcare",
    description:
      "Connecting families with secure, reliable, and compassionate healthcare services anytime, anywhere.",
    badge: "Trusted",
        badgeColor: "bg-blue-500",
    herobtn: 'Become our Family',
  },
  {
    id: 2,
    image:
      "https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1779608567/ChatGPT_Image_May_24_2026_01_12_04_PM_hm1mfc.png",
    title: "Secure Care Protection",
    description:
      "Advanced healthcare security, patient trust, and protected medical services built for peace of mind.",
    badge: "Secure",
      badgeColor: "bg-green-500",
    herobtn: 'Terms & Security',
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/davsexxnb/image/upload/q_auto/f_auto/v1779608980/copy_of_chatgpt_image_may_24_2026_01_13_46_pm_tqhime.png",
    title: "Smart Hospital Management",
    description:
      "Efficient hospital operations, seamless patient experience, and professional care management under one platform.",
    badge: "Premium",
      badgeColor: "bg-emerald-500",
    herobtn: 'Find Best Hospitals',
    link: "/hospitals",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop",
    title: "Partner With AapkaDhyan",
    description:
      "Collaborate with us as an organization, company, NGO, corporate wellness team, or healthcare technology partner.",
    badge: "Partnership",
    badgeColor: "bg-cyan-500",
    herobtn: "Apply as Partner",
    link: "/partners",
  },
];

const PremiumCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 60) nextSlide();
    if (distance < -60) prevSlide();

    setTouchStart(null);
  };

  return (
    <section className="w-full overflow-hidden">
      <div
        className="relative h-[55vh] w-full overflow-hidden bg-slate-900 sm:h-[65vh] md:h-[75vh] lg:h-[85vh] xl:h-screen"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "z-10 opacity-100 scale-100"
                : "z-0 opacity-0 scale-105"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover brightness-75"
              loading={index === 0 ? "eager" : "lazy"}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

            <div className="absolute inset-0 flex items-end px-4 pb-12 sm:px-8 sm:pb-16 md:px-14 md:pb-20 lg:px-24">
              <div
                className={`max-w-4xl text-white transition-all duration-700 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                <span
                  className={`mb-4 inline-block rounded-full px-4 py-2 text-xs font-semibold sm:text-sm ${slide.badgeColor}`}
                >
                  {slide.badge}
                </span>

                <h2 className="mb-4 text-3xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {slide.title}
                </h2>

                <p className="mb-6 max-w-2xl text-sm text-slate-200 sm:text-lg md:text-xl lg:text-2xl">
                  {slide.description}
                </p>

                <button
                  type="button"
                  onClick={() => navigate(slide.link || "/")}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:scale-105 hover:bg-slate-100 sm:px-8 sm:py-4 sm:text-base md:text-lg"
                >
                  {slide.herobtn}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Left hover area */}
        <div className="group/left absolute left-0 top-0 z-30 hidden h-full w-24 items-center justify-start md:flex lg:w-36">
          <button
            onClick={prevSlide}
            className="ml-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition duration-300 hover:bg-white/30 group-hover/left:opacity-100 lg:h-14 lg:w-14"
            aria-label="Previous slide"
          >
            ❮
          </button>
        </div>

        {/* Right hover area */}
        <div className="group/right absolute right-0 top-0 z-30 hidden h-full w-24 items-center justify-end md:flex lg:w-36">
          <button
            onClick={nextSlide}
            className="mr-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition duration-300 hover:bg-white/30 group-hover/right:opacity-100 lg:h-14 lg:w-14"
            aria-label="Next slide"
          >
            ❯
          </button>
        </div>

        <button
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          className="absolute right-4 top-4 z-40 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30 sm:text-sm"
        >
          {isAutoPlaying ? "Pause" : "Play"}
        </button>

        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "h-3 w-8 bg-white"
                  : "h-3 w-3 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumCarousel;
