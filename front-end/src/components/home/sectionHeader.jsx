import { ArrowRight } from "lucide-react";

export default function SectionHeader({ title, sub, link, onClick }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {link && (
        <button onClick={onClick}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition-colors">
          {link} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}