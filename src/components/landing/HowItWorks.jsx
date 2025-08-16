import { FiCreditCard, FiShield, FiHeart } from "react-icons/fi";

export default function HowItWorks() {
  const steps = [
    { step: "01", title: "Connect Wallet", description: "Start by connecting your Web3 wallet.", icon: FiCreditCard },
    { step: "02", title: "Choose Plan", description: "Pick Basic, Premium, or Platinum.", icon: FiShield },
    { step: "03", title: "Get Covered", description: "Policy is live on-chain. Claim anytime.", icon: FiHeart },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12">Simple steps to get covered</p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                  {s.step}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{s.title}</h3>
              <p className="text-white/70">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
