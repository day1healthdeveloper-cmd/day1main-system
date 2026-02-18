export function ThreePlanCards() {
  const tiers = [
    {
      name: "Ultra Value Plus Starter",
      price: 189,
    },
    {
      name: "Value Plus Hospital",
      price: 390,
    },
    {
      name: "Executive Hospital",
      price: 640,
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Choose your Day1Health plan
          </h2>
          <p className="text-xl text-slate-600">Clear options for every life stage.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-green-600 hover:shadow-xl transition-all text-center"
            >
              {/* Logo */}
              <div className="mb-6">
                <img src="/Logo.jpg" alt="Day1Health" className="h-16 w-auto mx-auto" />
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-navy-900 mb-6">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-8">
                <p className="text-sm text-slate-600 mb-1">Starting From</p>
                <p className="text-5xl font-bold text-green-600 mb-1">R{tier.price}</p>
                <p className="text-sm text-slate-600">Per month</p>
              </div>

              {/* CTA */}
              <button className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors">
                1-min sign up
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
