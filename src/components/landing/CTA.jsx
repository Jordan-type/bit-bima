import Link from "next/link";
import { FiArrowRight, FiFileText } from "react-icons/fi";

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-700">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Revolutionize Your Healthcare?
        </h2>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Join thousands who’ve switched to decentralized health insurance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <button className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span>Start Your Journey</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
            <FiFileText />
            <span>View Documentation</span>
          </button>
        </div>
      </div>
    </section>
  );
}
