'use client';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleChoice = (role: string) => {
    router.push(`/login?role=${role}`);
  };

  return (
    <main className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="text-center mb-12">
        <div className="bg-emerald-500/20 p-4 rounded-2xl w-fit mx-auto mb-6 border border-emerald-500/50">
          <BrainCircuit className="text-emerald-400 w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4">
          SCWM <span className="text-emerald-500">INTELLIGENCE</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Advanced AI-driven waste classification and orbital debris management system.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button onClick={() => handleChoice('User')} className="group p-8 bg-[#0B1224] border border-slate-800 rounded-3xl hover:border-emerald-500/50 transition-all text-left shadow-2xl">
          <User className="w-12 h-12 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Continue as User</h2>
          <p className="text-slate-500 text-sm font-medium">Scan debris and find disposal centers near Bengaluru.</p>
        </button>

        <button onClick={() => handleChoice('Admin')} className="group p-8 bg-[#0B1224] border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all text-left shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Continue as Admin</h2>
          <p className="text-slate-500 text-sm font-medium">Access deep sustainability analytics and impact metrics.</p>
        </button>
      </div>
    </main>
  );
}
