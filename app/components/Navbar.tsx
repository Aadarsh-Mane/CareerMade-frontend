"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Bookmark,
  Stethoscope,
  LogOut,
  User,
  Briefcase,
  Bell,
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ============================
     AUTH CHECK (PRODUCTION SAFE)
  ============================ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hide navbar on public routes
    if (pathname === "/login" || pathname === "/register") {
      setIsAuthChecked(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      setIsAuthChecked(true);
    } catch (error) {
      console.error("Invalid user data");
      router.replace("/login");
    }
  }, [router, pathname]);

  /* ============================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ============================ */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ============================
     NAV HANDLERS (UNCHANGED)
  ============================ */
  const handleProfileClick = () => {
    if (!user) return router.push("/login");

    if (user.role === "employer")
      router.push("/dashboard/employee/profile");
    else if (user.role === "jobseeker")
      router.push("/dashboard/jobseeker/profile");
    else router.push("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const handleSavedJobsClick = () =>
    router.push("/dashboard/jobseeker/bookmarks");

  const handleResume = () =>
    router.push("/dashboard/jobseeker/resume");

  /* ============================
     BLOCK RENDER UNTIL AUTH VERIFIED
  ============================ */
  if (!isAuthChecked) return null;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT: LOGO + NAV */}
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/")}
            >
              <img src="/logo.png" alt="CareerMade" className="h-8" />
            </motion.div>

            {/* JOBSEEKER NAV */}
            {user?.role === "jobseeker" && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() =>
                    router.push("/dashboard/jobseeker")
                  }
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Jobs
                </button>

                <button
                  onClick={() =>
                    router.push("/dashboard/jobseeker/employers")
                  }
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Employers
                </button>
              </div>
            )}

            {/* EMPLOYER NAV */}
            {user?.role === "employer" && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() =>
                    router.push("/dashboard/employee/jobs")
                  }
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  My Job Postings
                </button>

                <button
                  onClick={() =>
                    router.push("/dashboard/employee/jobs/create")
                  }
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Create Job
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="relative flex gap-1" ref={dropdownRef}>
            {user?.role === "jobseeker" && (
              <button
                onClick={handleResume}
                className="flex items-center gap-1 px-2 text-sm font-medium"
              >
                <Image
                  src="/star.png"
                  alt="InstantCV"
                  width={16}
                  height={16}
                />
                InstantCV
              </button>
            )}

            <button className="flex items-center px-3">
              <Bell size={18} />
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700"
            >
              <User size={18} className="text-white" />
            </button>

            {/* DROPDOWN */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl p-5 z-50"
                >
                  {/* PROFILE */}
                  <div className="flex items-center space-x-3 border-b pb-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {user?.firstName} {user?.lastName || ""}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {user?.role}
                      </p>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleProfileClick();
                        }}
                        className="text-blue-600 text-sm font-medium"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* MENU */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/")}
                      className="flex items-center gap-3"
                    >
                      <Home size={18} /> Home
                    </button>

                    {user?.role === "jobseeker" && (
                      <>
                        <button
                          onClick={() =>
                            router.push("/dashboard/jobseeker/applications")
                          }
                          className="flex items-center gap-3"
                        >
                          <FileText size={18} /> My Applications
                        </button>

                        <button
                          onClick={handleSavedJobsClick}
                          className="flex items-center gap-3"
                        >
                          <Bookmark size={18} /> Saved Jobs
                        </button>

                        <button
                          onClick={handleResume}
                          className="flex items-center gap-3"
                        >
                          <Stethoscope size={18} /> Resume
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-red-500"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
