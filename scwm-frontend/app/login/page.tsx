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
