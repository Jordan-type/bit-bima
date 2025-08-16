import { FiStar } from "react-icons/fi";

export default function Testimonials() {
  const t = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
      content: "HealthChain processed my claim in under 10 minutes. Traditional insurance would have taken weeks!",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "Healthcare Provider",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
      content: "Transparency and automation make it easier to help my patients get care.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Policy Holder",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Lower costs, faster claims, and I actually own my policy on-chain.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What Our Users Say</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">Real experiences from real people</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {t.map((item) => (
            <div key={item.name} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center mb-6">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="text-white font-semibold">{item.name}</h4>
                  <p className="text-white/60 text-sm">{item.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(item.rating)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-white/80 italic">"{item.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
