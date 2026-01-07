#!/bin/bash

# 1. Create directory structure
mkdir -p scwm-frontend/app/login
mkdir -p scwm-frontend/app/dashboard

# 2. Move existing scanner logic to the new dashboard route
# This preserves all your hardcoded Bengaluru data and axios logic
mv scwm-frontend/app/page.tsx scwm-frontend/app/dashboard/page.tsx

# 3. Create the Landing Page (Role Selection)
cat <<EOF > scwm-frontend/app/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleChoice = (role: string) => {
    router.push(\`/login?role=\${role}\`);
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
EOF

# 4. Create the Login Page
cat <<EOF > scwm-frontend/app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'User';
  const [username, setUsername] = useState('');

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (!username) return;
    sessionStorage.setItem('scwm_user', username);
    sessionStorage.setItem('scwm_role', role);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#020817] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-[#0B1224] border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <button onClick={() => router.push('/')} className="text-slate-500 hover:text-white mb-8 flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold mb-2 capitalize text-emerald-400">{role} Terminal</h1>
        <p className="text-slate-500 mb-8">Initialize neural link by entering operator name.</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            required
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Operator Name"
            className="w-full bg-[#020817] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
            Access System
          </button>
        </form>
      </div>
    </main>
  );
}
EOF

echo "File structure updated and pages generated successfully!"