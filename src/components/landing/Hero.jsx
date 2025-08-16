import Link from "next/link";
import { FiArrowRight, FiFileText } from "react-icons/fi";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          The Future of
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {" "}Health Insurance
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
          Experience instant claims, lower costs, and complete transparency with blockchain-powered health insurance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <button className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span>Get Started Now</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="group bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
            <FiFileText />
            <span>Learn More</span>
          </button>
        </div>
      </div>
    </section>
  );
}
