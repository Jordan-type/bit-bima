import Link from "next/link";
import { FiCheck } from "react-icons/fi";

export default function Plans() {
  const plans = [
    {
      name: "Basic",
      price: "0.1",
      monthlyPrice: "0.01",
      coverage: "10",
      deductible: "0.5",
      features: ["Basic health coverage", "Emergency care", "Prescription drugs", "24/7 telehealth", "Mobile app access"],
      popular: false,
    },
    {
      name: "Premium",
      price: "0.25",
      monthlyPrice: "0.025",
      coverage: "25",
      deductible: "0.25",
      features: ["All Basic features", "Specialist consultations", "Mental health coverage", "Dental & vision", "Wellness programs", "Priority claim processing"],
      popular: true,
    },
    {
      name: "Platinum",
      price: "0.5",
      monthlyPrice: "0.05",
      coverage: "50",
      deductible: "0.1",
      features: ["All Premium features", "International coverage", "Concierge medical services", "Alternative treatments", "Family coverage", "Zero waiting periods", "Premium support"],
      popular: false,
    },
  ];

  return (
    <section id="plans" className="py-20 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">Transparent pricing. Pay with crypto.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                p.popular ? "border-cyan-400 ring-2 ring-cyan-400/50" : "border-white/20 hover:border-white/40"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">{p.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  <span className="text-white/60 ml-2">ETH/year</span>
                </div>
                <div className="text-white/60">or {p.monthlyPrice} ETH/month</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/80">
                  <span>Coverage Amount</span>
                  <span className="font-semibold">{p.coverage} ETH</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Deductible</span>
                  <span className="font-semibold">{p.deductible} ETH</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center text-white/80">
                    <FiCheck className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/dashboard">
                <button className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 ${
                  p.popular ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg" : "bg-white/20 hover:bg-white/30"
                }`}>
                  Get {p.name} Plan
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
