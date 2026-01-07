'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Mail, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'User';
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) return;
    
    // Store credentials for the session
    sessionStorage.setItem('scwm_user', formData.username);
    sessionStorage.setItem('scwm_role', role);
    
    // Redirect to the dashboard
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#020817] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-[#0B1224] border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => router.push('/')} 
          className="text-slate-500 hover:text-white mb-8 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Role Selection
        </button>
        
        <h1 className="text-3xl font-bold mb-2 capitalize text-emerald-400">
          {role} Authentication
        </h1>
        <p className="text-slate-500 mb-8">Enter your credentials to access the SCWM network.</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 text-slate-600 w-5 h-5" />
              <input 
                required
                name="username"
                type="text" 
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Operator Name"
                className="w-full bg-[#020817] border border-slate-800 rounded-xl px-12 py-3 text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-600 w-5 h-5" />
              <input 
                required
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@scwm.intel"
                className="w-full bg-[#020817] border border-slate-800 rounded-xl px-12 py-3 text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-600 w-5 h-5" />
              <input 
                required
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full bg-[#020817] border border-slate-800 rounded-xl px-12 py-3 text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Access System
          </button>
        </form>
      </div>
    </main>
  );
}
