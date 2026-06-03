import { Construction } from "lucide-react";

const DashboardPlaceholder = ({ title, description }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur-xl">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        <Construction size={32} />
      </div>

      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-500">{description}</p>
    </div>
  );
};

export default DashboardPlaceholder;
