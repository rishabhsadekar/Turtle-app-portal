import React from "react";
import Link from "next/link";
import {
  Bot,
  Cpu,
  Wrench,
  Zap,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users,
  Compass,
  Search,
} from "lucide-react";

export default function HomePage() {
  const tracks = [
    {
      title: "Hatchling Development",
      icon: Sparkles,
      color: "border-yellow-500/30 bg-yellow-500/5",
      iconBg: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      description:
        "Designed specifically for freshman and students new to robotics. Hands-on semester-long incubators covering CAD, programming, circuitry, and hands-on fabrication.",
      skills: ["Robotics Fundamentals", "Arduino / Microcontrollers", "SolidWorks CAD", "Team Builds"],
    },
    {
      title: "Software & Autonomy",
      icon: Cpu,
      color: "border-blue-500/30 bg-blue-500/5",
      iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      description:
        "Architecting autonomous navigation, perception, and control systems for competitive robotics and autonomous rovers.",
      skills: ["ROS 2 / C++ / Python", "Computer Vision / OpenCV", "SLAM & Path Planning", "Control Systems"],
    },
    {
      title: "Mechanical Design",
      icon: Wrench,
      color: "border-amber-500/30 bg-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      description:
        "End-to-end design, FEA structural simulation, CNC machining, and rapid additive manufacturing for robot chassis and active manipulators.",
      skills: ["SolidWorks / Onshape", "Rapid 3D Prototyping", "Machining & Fabrication", "FEA Analysis"],
    },
    {
      title: "Electrical & Firmware",
      icon: Zap,
      color: "border-purple-500/30 bg-purple-500/5",
      iconBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      description:
        "Power distribution architecture, custom PCB schematic & layout design, embedded C/C++ firmware, and real-time CAN bus telemetry.",
      skills: ["KiCad / Altium", "Embedded C/C++", "Power Electronics", "Sensor Integration"],
    },
    {
      title: "Business & Operations",
      icon: Briefcase,
      color: "border-emerald-500/30 bg-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      description:
        "Powering team logistics, corporate sponsorship pipelines, social media, STEM community outreach, and finance.",
      skills: ["Sponsorship Relations", "Budget & Finance", "Event Planning", "Media & Branding"],
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Choose 1–5 Projects",
      desc: "Explore all 24 projects from turtlerobotics.org/projects, rank your choices, and answer project-specific technical questions.",
    },
    {
      num: "02",
      title: "Executive Review",
      desc: "Project leads and executive officers evaluate your responses, background, and alignment with project goals.",
    },
    {
      num: "03",
      title: "Technical & Fit Interview",
      desc: "A conversational 20-30 minute interview with project leads to discuss your interests and team placement.",
    },
    {
      num: "04",
      title: "Welcome to the Lab",
      desc: "Join the TURTLE community, gain card access to the robotics facility in 023 Haynes Engineering Building, and start building!",
    },
  ];

  return (
    <div className="bg-[#0a0a0f] text-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-radial-hero pt-14 pb-24 border-b border-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Texas A&M Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161722] border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wide shadow-lg shadow-yellow-500/5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>Texas A&M University • Member Application Portal</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
              TURTLE <span className="text-yellow-400">ROBOTICS</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
              Pioneering robotics solutions and student leadership development at <span className="text-white font-medium">Texas A&M University</span>.
            </p>

            {/* Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-yellow-500 text-black font-extrabold text-sm shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 hover:scale-105 transition-all duration-300 group"
              >
                Apply for 1–5 Projects
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </Link>
              <Link
                href="/status"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#14151e] border border-gray-700/80 text-gray-200 font-semibold text-sm hover:bg-[#1c1d2b] hover:text-white hover:border-gray-600 transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2 text-yellow-400" />
                Check Application Status
              </Link>
            </div>

            {/* Quick stats banner */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-[#111218]/90 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-sm text-center">
                <div className="text-2xl font-black text-yellow-400">24</div>
                <div className="text-xs text-gray-400 font-medium mt-1">Active Projects</div>
              </div>
              <div className="bg-[#111218]/90 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-sm text-center">
                <div className="text-2xl font-black text-yellow-400">1–5</div>
                <div className="text-xs text-gray-400 font-medium mt-1">Project Preferences</div>
              </div>
              <div className="bg-[#111218]/90 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-sm text-center">
                <div className="text-2xl font-black text-yellow-400">Hatchling</div>
                <div className="text-xs text-gray-400 font-medium mt-1">Freshman Incubator</div>
              </div>
              <div className="bg-[#111218]/90 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-sm text-center">
                <div className="text-2xl font-black text-yellow-400">Haynes</div>
                <div className="text-xs text-gray-400 font-medium mt-1">023 Haynes Lab Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Tracks Section */}
      <section className="py-20 bg-[#07070a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Subteams & Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Find Your Calling in Robotics
            </h2>
            <p className="text-sm text-gray-400 mt-3">
              Whether you are completely new to robotics or an experienced builder, our subteams and project tracks give you real responsibility from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.title}
                  className="bg-[#111218] rounded-2xl p-6 border border-gray-800 hover:border-yellow-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2.5 rounded-xl ${track.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{track.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-5">
                      {track.description}
                    </p>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Key Focus Areas
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#1a1b24] text-gray-300 border border-gray-700/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Direct CTA card */}
            <div className="bg-gradient-to-br from-[#1a190b] to-[#111218] border border-yellow-500/30 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 mb-3">
                  All Majors Welcome
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Ready to Start Building?
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  Select up to 5 projects from our 24 active projects including DIRT, Combat Robotics, Drone Swarms, Humanoids, and Prosthetics.
                </p>
              </div>
              <Link
                href="/apply"
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md transition-all"
              >
                Start Application <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Timeline */}
      <section className="py-20 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Application Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              How Joining TURTLE Works
            </h2>
            <p className="text-sm text-gray-400 mt-3">
              A transparent, streamlined 4-step recruitment cycle designed to discover your strengths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step) => (
              <div key={step.num} className="relative flex flex-col space-y-3 bg-[#111218] p-5 rounded-2xl border border-gray-800/80">
                <div className="text-3xl font-black text-yellow-400/30 tracking-tight">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 rounded-2xl bg-[#111218] border border-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center shrink-0 font-bold">
                <Calendar className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Current Recruitment Cycle
                </h4>
                <p className="text-xs text-gray-400">
                  Applications are accepted during the first weeks of the semester. Decisions released on a rolling basis.
                </p>
              </div>
            </div>
            <Link
              href="/apply"
              className="shrink-0 px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md transition-all hover:scale-105"
            >
              Start Member Application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
