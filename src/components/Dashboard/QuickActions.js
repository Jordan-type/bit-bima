import {
  FiPlus,
  FiFileText,
  FiCreditCard,
  FiShield,
  FiArrowUpRight,
  FiZap,
  FiLock,
} from "react-icons/fi";

// Mock Link component - replace with your actual Next.js Link
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

const QuickActions = () => {
  const actions = [
    {
      name: "Buy Insurance",
      href: "/plans",
      icon: FiShield,
      description: "Purchase blockchain-secured health insurance",
      color: "indigo",
      gradient: "from-indigo-500 to-blue-600",
      bgPattern: "from-indigo-500/10 to-blue-600/10",
      hoverShadow: "hover:shadow-indigo-500/25",
    },
    {
      name: "Submit Claim",
      href: "/claims",
      icon: FiFileText,
      description: "File transparent, verifiable insurance claims",
      color: "green",
      gradient: "from-emerald-500 to-green-600",
      bgPattern: "from-emerald-500/10 to-green-600/10",
      hoverShadow: "hover:shadow-emerald-500/25",
    },
    {
      name: "Pay Premium",
      href: "/policies",
      icon: FiCreditCard,
      description: "Secure crypto payments for your premiums",
      color: "purple",
      gradient: "from-purple-500 to-violet-600",
      bgPattern: "from-purple-500/10 to-violet-600/10",
      hoverShadow: "hover:shadow-purple-500/25",
    },
    {
      name: "Manage Policies",
      href: "/policies",
      icon: FiZap,
      description: "Smart contract policy management",
      color: "cyan",
      gradient: "from-cyan-500 to-teal-600",
      bgPattern: "from-cyan-500/10 to-teal-600/10",
      hoverShadow: "hover:shadow-cyan-500/25",
    },
  ];

  return (
    <div className="relative bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white/50 to-blue-50/30"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
            <FiZap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">
              Fast access to key blockchain operations
            </p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative block"
            >
              <div
                className={`
                relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-lg 
                transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${action.hoverShadow}
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500/50
              `}
              >
                {/* Background Pattern */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.bgPattern} opacity-20`}
                ></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.1),_transparent_50%)]"></div>

                {/* Floating particles */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
                <div
                  className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>

                {/* Icon Section */}
                <div className="relative mb-4">
                  <div className="inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <action.icon
                      className="h-6 w-6 drop-shadow-sm"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Security indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full border border-white/50 flex items-center justify-center">
                    <FiLock className="h-2 w-2 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-white/90 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed group-hover:text-white/70 transition-colors">
                    {action.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1">
                  <FiArrowUpRight className="h-5 w-5 drop-shadow-sm" />
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>

                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/20 via-white/40 to-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>

              {/* External Glow on Hover */}
              <div
                className={`
                absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-20 
                blur-xl transition-all duration-300 -z-10 transform group-hover:scale-110
              `}
              ></div>
            </Link>
          ))}
        </div>

        {/* Bottom Info Section */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-blue-700">
              <FiShield className="h-4 w-4" />
              <span className="font-medium">
                All actions secured by blockchain
              </span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Network Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
