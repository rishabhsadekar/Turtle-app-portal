import React from "react";
import Link from "next/link";
import { Bot, Mail, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#07070a] text-gray-400 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black">
                <Bot className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                TURTLE <span className="text-yellow-400">Robotics</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-md leading-relaxed">
              Texas A&M University Robotics Team and Leadership Experience (TURTLE) is dedicated to empowering students through hands-on competitive robotics, biomedical devices, autonomous rovers, and engineering incubators.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span className="text-gray-300 font-medium">Recruitment Open for Fall / Spring Cohorts</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Portal Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-yellow-400 transition-colors">
                  Overview & Programs
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-yellow-400 transition-colors">
                  Apply for Projects (1–5)
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-yellow-400 transition-colors">
                  Check Application Status
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-yellow-400 transition-colors">
                  Officer Review & Questions Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Connect With Us
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                <a
                  href="mailto:turtlerobotics@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  turtlerobotics@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>023 Haynes Engineering Building, College Station, TX 77843</span>
              </div>
              <div>
                <a
                  href="https://turtlerobotics.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-yellow-400 hover:text-yellow-300 font-semibold mt-1"
                >
                  turtlerobotics.org <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 text-center text-[11px] text-gray-500">
          <p>
            © {new Date().getFullYear()} TURTLE Robotics at Texas A&M University. Built by and for Aggie Engineers.
          </p>
        </div>
      </div>
    </footer>
  );
}
