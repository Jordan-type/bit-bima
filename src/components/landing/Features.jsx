import { FiShield, FiZap, FiLock, FiTrendingUp, FiUsers, FiHeart } from "react-icons/fi";

export default function Features() {
  const items = [
    { icon: FiShield, title: "Blockchain Security", description: "Immutable security for your data." },
    { icon: FiZap, title: "Instant Claims", description: "Smart contracts automate processing." },
    { icon: FiLock, title: "Decentralized", description: "You own your on-chain policy." },
    { icon: FiTrendingUp, title: "Lower Costs", description: "Cut middlemen with automation." },
    { icon: FiUsers, title: "Global Access", description: "Your cover follows your wallet." },
    { icon: FiHeart, title: "AI-Powered", description: "Detect fraud & optimize claims." },
  ];

  return (
    <section id="features" className="py-20 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Why Choose HealthChain?</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">Features that put you in control</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((f, i) => (
            <article
              key={i}
              className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
              <p className="text-white/70 leading-relaxed">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
