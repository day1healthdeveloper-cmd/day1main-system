'use client';

export function FromConfusionToCover() {
  const solutions = [
    {
      problem: "I don't know which plan to choose",
      solution: "Pick a cover. We match the plan."
    },
    {
      problem: "Waiting periods waste my money",
      solution: "Covered from Day 1. No waiting."
    },
    {
      problem: "I'll pay for things I don't need",
      solution: "Start with what matters. See the rest clearly."
    },
    {
      problem: "This will take forever",
      solution: "1-minute signup. Seriously."
    }
  ];

  return (
    <section className="relative py-12 px-4 md:px-6 overflow-hidden bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            You're probably asking yourself:
          </h2>
        </div>

        {/* Problem → Solution Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {solutions.map((item, idx) => (
            <div 
              key={idx}
              className="glass-soft p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
            >
              <p className="text-gray-400 text-base mb-3 italic">
                "{item.problem}"
              </p>
              <p className="text-green-600 text-lg font-bold">
                → {item.solution}
              </p>
            </div>
          ))}
        </div>

        {/* Logic Bridge Line */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-base">
            It's a decision about priorities, not just coverage.
          </p>
        </div>
      </div>
    </section>
  );
}
