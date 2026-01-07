"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#020817] border-b border-white/10">
      {/* Left */}
      <div className="text-xl font-semibold text-white flex items-center gap-2">
        🧠 <span>SCWM Intelligence</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium
                     hover:bg-emerald-400 transition-all"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
