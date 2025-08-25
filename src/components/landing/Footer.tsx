import { FiShield } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">HealthChain</span>
            </div>
            <p className="text-white/60 mb-6 max-w-md">
              Revolutionizing healthcare with blockchain technology. Secure, transparent, and accessible insurance for everyone.
            </p>
            <div className="flex space-x-4">
              {["twitter", "discord", "github"].map((n) => (
                <a key={n} href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                  <i className={`fab fa-${n}`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-white/60">
              {["Features", "Pricing", "Security", "API"].map((x) => (
                <li key={x}><a href="#" className="hover:text-white transition-colors">{x}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-white/60">
              {["Documentation", "Help Center", "Contact Us", "Status"].map((x) => (
                <li key={x}><a href="#" className="hover:text-white transition-colors">{x}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} HealthChain. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((x) => (
              <a key={x} href="#" className="text-white/60 hover:text-white text-sm transition-colors">{x}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
