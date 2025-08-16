import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating blockchain nodes with subtle animation */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-cyan-500/6 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/2 w-16 h-16 bg-emerald-500/6 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "6s" }}
        ></div>

        {/* Subtle grid pattern for blockchain feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Flowing data streams */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-200/30 to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-cyan-200/20 to-transparent"></div>
      </div>

      {/* Enhanced Toaster with blockchain theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "#fff",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.05)",
            backdropFilter: "blur(12px)",
          },
          success: {
            duration: 3000,
            style: {
              background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              boxShadow:
                "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.05)",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              boxShadow:
                "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.05)",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            style: {
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow:
                "0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.05)",
            },
          },
        }}
      />

      {/* Sidebar with enhanced backdrop */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area with enhanced styling */}
      <div className="lg:pl-72 relative">
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main content with beautiful container */}
        <main className="relative py-10">
          {/* Content wrapper with subtle enhancements */}
          <div className="px-4 sm:px-6 lg:px-8 relative">
            {/* Subtle glow effects around content area */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-96 h-24 bg-blue-500/5 rounded-full blur-3xl"></div>

            {/* Content container with enhanced styling */}
            <div className="relative">
              {/* Optional: Add a subtle border/shadow to main content */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl -m-4 shadow-sm border border-white/50 opacity-0 peer-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Main content */}
              <div className="relative z-10">{children}</div>
            </div>
          </div>

          {/* Floating action elements for blockchain feel */}
          <div className="fixed bottom-8 right-8 z-30 flex flex-col space-y-3">
            {/* Blockchain status indicator */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-3 border border-green-200/50 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900/90 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
                Blockchain Connected
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900/90"></div>
              </div>
            </div>
          </div>

          {/* Enhanced bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none"></div>
        </main>
      </div>

      {/* Global styles for enhanced blockchain theme */}
      <style jsx global>{`
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.05);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb, #0891b2);
        }

        /* Enhanced focus styles for accessibility */
        *:focus {
          outline: 2px solid rgba(59, 130, 246, 0.6);
          outline-offset: 2px;
        }

        /* Smooth transitions for interactive elements */
        button,
        a,
        input,
        textarea,
        select {
          transition: all 0.2s ease-in-out;
        }

        /* Enhanced backdrop filter support */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default Layout;
