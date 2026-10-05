"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bot,
  FileText,
  Search,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  User,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const mainLinks = [
    { href: "/", label: "Home", icon: Bot },
    { href: "/apply", label: "Apply Now", icon: FileText },
    { href: "/status", label: "Application Status", icon: Search },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0c0d14]/90 backdrop-blur-xl border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand matching turtlerobotics.org */}
          <Link href="/" className="flex items-center space-x-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform duration-200">
              <Bot className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tight text-yellow-400 group-hover:text-yellow-300 transition-colors">
                  TURTLE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-aggie-maroon/70 text-red-200 border border-red-500/30 uppercase tracking-wider">
                  Texas A&M
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide hidden sm:block">
                Robotics Team & Leadership Experience
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "text-yellow-400 bg-yellow-400/10 font-bold"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5 opacity-80" />
                  {link.label}
                </Link>
              );
            })}

            {/* Applicant Auth State */}
            {status === "authenticated" && session?.user ? (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#111218] border border-gray-700 hover:border-yellow-500/50 text-xs text-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center overflow-hidden shrink-0 text-yellow-400 font-bold text-[10px]">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(session.user.name || "A").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="max-w-[110px] truncate font-medium">{session.user.name || session.user.email?.split("@")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111218] border border-gray-800 shadow-xl py-2 z-50 animate-in fade-in"
                  >
                    <div className="px-4 py-2 border-b border-gray-800/80">
                      <div className="font-bold text-xs text-white truncate">{session.user.name}</div>
                      <div className="text-[11px] text-yellow-400 font-mono truncate">{session.user.email}</div>
                    </div>
                    <Link
                      href="/apply"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <FileText className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                      Application Form
                    </Link>
                    <Link
                      href="/status"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <Search className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                      Check My Status
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 border-t border-gray-800/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`ml-2 inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  pathname === "/login"
                    ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                    : "border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 bg-white/5"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-yellow-400" />
                Applicant Login
              </Link>
            )}

            {/* Officer Portal Link */}
            <Link
              href="/admin"
              className={`ml-3 inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                pathname === "/admin"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-500/20 scale-105"
                  : "bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105 shadow-md shadow-yellow-500/10"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              Officer Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800 bg-[#0c0d14] px-4 pt-2 pb-4 space-y-1">
          {status === "authenticated" && session?.user ? (
            <div className="p-3 bg-[#111218] rounded-xl border border-gray-800 mb-2 flex items-center justify-between">
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{session.user.name}</div>
                <div className="text-[11px] text-yellow-400 font-mono truncate">{session.user.email}</div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/30"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-white/5 text-yellow-400 border border-yellow-500/30 mb-2"
            >
              <LogIn className="w-4 h-4 mr-3" />
              Applicant Login (TAMU Google)
            </Link>
          )}

          {mainLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-yellow-500 text-black font-bold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-bold bg-yellow-500 text-black mt-2"
          >
            <ShieldCheck className="w-4 h-4 mr-3 stroke-[2.5]" />
            Officer Portal
          </Link>
        </div>
      )}
    </nav>
  );
}
