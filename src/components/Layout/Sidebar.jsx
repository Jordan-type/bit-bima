import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiHome,
  FiShield,
  FiFileText,
  FiCreditCard,
  FiSettings,
  FiX,
  FiBarChart,
  FiUsers,
  FiHeart,
  FiLock,
  FiZap,
  FiGlobe,
} from "react-icons/fi";
import { GiHeartOrgan } from "react-icons/gi";
import { MdAdminPanelSettings } from "react-icons/md";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: FiHome },
  { name: "Insurance Plans", href: "/plans", icon: FiShield },
  { name: "My Policies", href: "/policies", icon: FiFileText },
  { name: "Claims", href: "/claims", icon: FiCreditCard },
  { name: "Analytics", href: "/analytics", icon: FiBarChart },
  { name: "Admin", href: "/admin", icon: MdAdminPanelSettings },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Sidebar = ({ open, setOpen }) => {
  const router = useRouter();

  const SidebarContent = () => (
    <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 pb-4 shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.1),_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(34,211,238,0.1),_transparent_50%)]"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      {/* Logo section with enhanced design */}
      <div className="relative flex h-16 shrink-0 items-center border-b border-white/10">
        <div className="flex items-center space-x-3">
          {/* Enhanced logo with glow effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <GiHeartOrgan className="h-7 w-7 text-white drop-shadow-lg" />
              {/* Pulse indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse shadow-lg"></div>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              HealthCare
              <span className="text-cyan-400 ml-1">Chain</span>
            </h1>
            <p className="text-sm text-blue-200 font-medium">Insurance DApp</p>
          </div>
        </div>
      </div>

      <nav className="relative flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-r-2 border-blue-400 shadow-lg shadow-blue-500/25"
                          : "text-blue-100 hover:text-white hover:bg-white/10",
                        "group relative flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 border border-transparent hover:border-white/10"
                      )}
                    >
                      {/* Icon with enhanced styling */}
                      <item.icon
                        className={classNames(
                          isActive
                            ? "text-blue-400 drop-shadow-sm"
                            : "text-blue-300 group-hover:text-blue-200 group-hover:scale-110",
                          "h-6 w-6 shrink-0 transition-all duration-200"
                        )}
                        aria-hidden="true"
                      />
                      <span className="relative z-10">{item.name}</span>

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      )}

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-200"></div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Enhanced bottom section */}
          <li className="relative mt-auto">
            {/* Blockchain status card */}
            <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-4 border border-emerald-500/20 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <FiLock className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-200">
                    Blockchain Status
                  </p>
                  <p className="text-xs text-emerald-300 font-medium">
                    Connected & Secure
                  </p>
                </div>
              </div>
            </div>

            {/* Main feature card with enhanced design */}
            <div className="relative rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-600/20 p-4 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 backdrop-blur-sm overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.1),_transparent_70%)]"></div>

              <div className="relative flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg">
                  <FiShield className="h-5 w-5 text-white drop-shadow" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Secure & Decentralized
                  </p>
                  <p className="text-xs text-indigo-200 font-medium">
                    Powered by Blockchain
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>

              {/* Additional stats */}
              <div className="relative mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-indigo-200">
                    <FiZap className="h-3 w-3" />
                    <span>Gas: Low</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-200">
                    <FiGlobe className="h-3 w-3" />
                    <span>Network: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar with enhanced backdrop */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <FiX
                        className="h-6 w-6 text-white drop-shadow"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>

                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
