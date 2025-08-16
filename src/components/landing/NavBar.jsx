"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { GiHeartOrgan } from "react-icons/gi";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <GiHeartOrgan className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">HealthChain</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-white/80 hover:text-white">Features</a>
              <a href="#plans" className="text-white/80 hover:text-white">Plans</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white">How it Works</a>
              <a href="#testimonials" className="text-white/80 hover:text-white">Testimonials</a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                Launch App
              </button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#plans", label: "Plans" },
              { href: "#how-it-works", label: "How it Works" },
              { href: "#testimonials", label: "Testimonials" },
            ].map((i) => (
              <a key={i.href} href={i.href} className="block px-3 py-2 text-white/80 hover:text-white">
                {i.label}
              </a>
            ))}
            <div className="pt-4 pb-3 border-t border-white/20">
              <div className="flex items-center px-3 space-x-3">
                <Link href="/dashboard">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold">
                    Launch App
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
