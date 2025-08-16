import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiMenu, FiBell, FiGlobe, FiShield, FiZap } from "react-icons/fi";
import { NETWORK_NAME } from "../../config/network";

const Header = ({ setSidebarOpen }) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl px-4 shadow-lg shadow-blue-500/5 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/50 to-cyan-50/30 pointer-events-none"></div>

      {/* Mobile menu button with enhanced styling */}
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 lg:hidden group"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu
          className="h-6 w-6 group-hover:scale-110 transition-transform"
          aria-hidden="true"
        />
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {/* Enhanced separator with gradient */}
      <div
        className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent lg:hidden"
        aria-hidden="true"
      />

      <div className="relative flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Enhanced network status with blockchain theming */}
          <div className="relative flex items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 px-4 py-2 shadow-sm">
            {/* Animated connection indicator */}
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>

            {/* Network icon */}
            <FiGlobe className="h-4 w-4 text-emerald-600" />

            <span className="text-sm font-semibold text-emerald-800 tracking-wide">
              {NETWORK_NAME}
            </span>

            {/* Subtle blockchain pattern */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/5 to-green-500/5"></div>
          </div>

          {/* Additional blockchain status indicators */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Gas tracker */}
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200/50">
              <FiZap className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Gas: 15</span>
            </div>

            {/* Security status */}
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-purple-50 border border-purple-200/50">
              <FiShield className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">
                Secure
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Enhanced notification button */}
          <button
            type="button"
            className="relative group rounded-xl bg-gradient-to-br from-white to-gray-50 p-2.5 text-gray-500 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-200/50 transition-all duration-200"
          >
            <span className="sr-only">View notifications</span>
            <FiBell
              className="h-5 w-5 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />

            {/* Enhanced notification badge */}
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/30 animate-pulse">
              3
            </span>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-200"></div>
          </button>

          {/* ConnectButton wrapper with enhanced styling */}
          <div className="relative">
            {/* Glow effect behind connect button */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>

            <div className="relative">
              <ConnectButton
                chainStatus="icon"
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </div>
  );
};

export default Header;
