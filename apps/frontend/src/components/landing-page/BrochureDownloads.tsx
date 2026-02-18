import { FileText } from "lucide-react";

export function BrochureDownloads() {
  const brochures = [
    "Starter Plan",
    "Starter+ Plan",
    "Core Plan",
    "Platinum Plan",
    "Executive Plan",
    "Senior Plan",
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-navy-900 text-center mb-12">
          Download full plan brochures
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {brochures.map((name) => (
            <button
              key={name}
              className="flex items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 hover:border-green-600 hover:bg-green-600 transition-all group"
            >
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              <span className="font-semibold text-slate-700 group-hover:text-white transition-colors">
                {name} PDF
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
