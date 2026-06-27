import { useEffect, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import API from "../../api/axios";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      const res = await API.get("/feedback/testimonials", {
        params: { limit: 6 },
      });

      setTestimonials(res.data.testimonials || []);
    } catch (error) {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <section className="bg-gradient-to-br from-white via-cyan-50 to-emerald-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-600">
              Testimonials
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Real feedback from{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                people using Med Ample.
              </span>
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 text-cyan-600 shadow-lg shadow-cyan-100">
            <MessageSquare size={38} />
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-bold text-slate-700">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cyan-200 bg-white/80 p-10 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 text-cyan-600" size={42} />
            <h3 className="text-xl font-black text-slate-900">
              No testimonials yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Use the feedback button to add the first testimonial.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item._id}
                className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-cyan-100/50 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={18}
                      fill={index < item.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <p className="min-h-24 text-sm leading-7 text-slate-600">
                  "{item.message}"
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="font-black text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-xs font-bold capitalize text-cyan-700">
                    {item.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
