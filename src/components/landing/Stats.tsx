export default function Stats() {
  const stats = [
    { number: "10,000+", label: "Active Policies" },
    { number: "99.9%", label: "Uptime" },
    { number: "< 5 min", label: "Avg Claim Time" },
    { number: "500+", label: "Healthcare Providers" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">{s.number}</div>
          <div className="text-white/60 font-medium">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
