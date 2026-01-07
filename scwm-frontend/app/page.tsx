'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Upload, Leaf, MapPin, History, Camera, PieChart, TrendingUp, Zap, AlertCircle, Lightbulb, ShieldCheck, BrainCircuit, ArrowRight, Recycle, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

// --- SKELETONS ---
const MapSkeleton = () => (
  <div className="h-[600px] w-full bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800 flex items-center justify-center backdrop-blur-sm">
    <div className="text-slate-600 flex flex-col items-center gap-2">
      <MapPin className="w-10 h-10 opacity-20" />
      <span className="text-sm font-medium tracking-wider">INITIALIZING NAVIGATION MODULE...</span>
    </div>
  </div>
);

const AnalysisSkeleton = () => (
  <div className="space-y-6 animate-pulse w-full">
    <div className="flex gap-4">
      <div className="h-24 w-1/2 bg-slate-800/50 rounded-2xl"></div>
      <div className="h-24 w-1/2 bg-slate-800/50 rounded-2xl"></div>
    </div>
    <div className="h-32 w-full bg-slate-800/30 rounded-2xl"></div>
    <div className="h-24 w-full bg-slate-800/30 rounded-2xl"></div>
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-end">
      <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
      <div className="h-4 w-24 bg-slate-800 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-40">
          <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
          <div className="h-10 w-20 bg-slate-800 rounded"></div>
        </div>
      ))}
    </div>
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-48"></div>
    <div className="bg-slate-900 rounded-2xl border border-slate-800 h-64"></div>
  </div>
);

// Dynamic import for Leaflet (Prevents Duplicate Scan UI)
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <MapSkeleton />
});

// --- TYPES ---
type ScanResult = { waste_type: string; confidence: number; status: string; advice: string; fact: string; scan_id?: number; };
type RecyclingCenter = { name: string; address: string; latitude: number; longitude: number; contact_info: string; type: string };
type ScanHistory = { id: number; waste_type: string; confidence: number; timestamp: string; };

// --- HARDCODED DATA: BENGALURU CENTERS ---
const BENGALURU_CENTERS: RecyclingCenter[] = [
  // 1. PVC Centers
  { name: "Mahaveer Plastic", address: "Kachanayakanahalli, Anekal", latitude: 12.7106, longitude: 77.6700, contact_info: "080-46068941", type: "pvc" },
  { name: "Zolopik Plastic Div", address: "Bommasandra Industrial Area", latitude: 12.8150, longitude: 77.6650, contact_info: "9743440440", type: "pvc" },
  { name: "S B M Polymers", address: "Kachohalli, Magadi Road", latitude: 12.9756, longitude: 77.4500, contact_info: "080-22975518", type: "pvc" },
  { name: "Green Plast Bengaluru", address: "Peenya Industrial Area", latitude: 13.0285, longitude: 77.5197, contact_info: "080-22975518", type: "pvc" },
  // 2. Brick Centers
  { name: "Rock Crystals C&D", address: "No 184, Near Vidya Nagar Camp, Chickjala", latitude: 13.1700, longitude: 77.6300, contact_info: "9844033811", type: "brick" },
  { name: "BBMP C&D Plant (Kannur)", address: "Kannur Village, Bidrahalli", latitude: 13.0645, longitude: 77.6744, contact_info: "080-22975518", type: "brick" },
  { name: "BBMP C&D Plant (Kadu Agrahara)", address: "Kadu Agrahara Grama, Bidhrahalli", latitude: 12.9865, longitude: 77.7612, contact_info: "080-22975518", type: "brick" },
  { name: "P.K. Cutting Tech", address: "Mobile Service, Bengaluru", latitude: 12.9716, longitude: 77.5946, contact_info: "9884722536", type: "brick" },
  // 3. Cementitious Debris
  { name: "Mallasandra C&D Site", address: "Sy. No. 33, Mallasandra Grama", latitude: 13.0300, longitude: 77.5200, contact_info: "080-22975518", type: "cementitious_debris" },
  { name: "SGV Earth Movers", address: "Channayakanapalya, Nagasandra", latitude: 13.0450, longitude: 77.4950, contact_info: "080-22975518", type: "cementitious_debris" },
  { name: "Mittaganahalli C&D Site", address: "Sy.No. 02, Mittaganahalli Grama", latitude: 13.1100, longitude: 77.6500, contact_info: "080-22975518", type: "cementitious_debris" },
  { name: "Guddadahalli Processing", address: "Sy.No. 43, Hesaraghatta Hobli", latitude: 13.1400, longitude: 77.5400, contact_info: "080-22975518", type: "cementitious_debris" },
  // 4. Rebar
  { name: "Bangalore Scraper LLP", address: "1st Main Road, Binnypete", latitude: 12.9650, longitude: 77.5550, contact_info: "080-22975518", type: "rebar" },
  { name: "A R Steels", address: "Mangammanapalya, Bommanahalli", latitude: 12.9020, longitude: 77.6320, contact_info: "080-22975518", type: "rebar" },
  { name: "Hindustan Commercial Co", address: "Old Guddadahalli", latitude: 12.9550, longitude: 77.5450, contact_info: "080-22975518", type: "rebar" },
  { name: "M S Traders", address: "Mangaman Palya, Bommanahalli", latitude: 12.9050, longitude: 77.6350, contact_info: "080-22975518", type: "rebar" },
  // 5. Wires
  { name: "Zolopik E-Waste JP Nagar", address: "#58, 22nd Main Rd, J. P. Nagar", latitude: 12.9100, longitude: 77.5850, contact_info: "9743440440", type: "wires" },
  { name: "Zolopik Whitefield", address: "Kadugodi Industrial Area", latitude: 12.9950, longitude: 77.7450, contact_info: "9743440440", type: "wires" },
  { name: "E-Parisara Pvt Ltd", address: "Dabaspet Industrial Area", latitude: 13.2300, longitude: 77.2400, contact_info: "080-22975518", type: "wires" },
  { name: "Recyclekaro Sompura", address: "Sompura KIADB, Nelamangala", latitude: 13.2000, longitude: 77.4000, contact_info: "080-22975518", type: "wires" }
];

const CO2_OFFSET_ESTIMATES: Record<string, number> = {
  'pvc': 2.5, 'brick': 0.8, 'cementitious_debris': 0.5, 'rebar': 1.8, 'wires': 3.2
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scan' | 'analytics'>('scan');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'analytics') {
      setHistoryLoading(true);
      axios.get('http://localhost:8000/history')
        .then(res => setHistory(res.data))
        .catch(console.error)
        .finally(() => {
           setTimeout(() => setHistoryLoading(false), 800); 
        });
    }
  }, [activeTab]);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/analyze', formData);
      setResult(response.data);
    } catch (err) { alert("Backend Connection Error"); } 
    finally { setLoading(false); }
  };

  const filteredCenters = useMemo(() => {
    if (!result) return [];
    return BENGALURU_CENTERS.filter(center => 
      center.type.toLowerCase() === result.waste_type.toLowerCase()
    );
  }, [result]);

  const stats = useMemo(() => {
    const total = history.length;
    if (total === 0) return null;
    const counts: Record<string, number> = {};
    let totalConfidence = 0;
    let totalCO2 = 0;
    history.forEach(h => {
      counts[h.waste_type] = (counts[h.waste_type] || 0) + 1;
      totalConfidence += h.confidence;
      totalCO2 += (CO2_OFFSET_ESTIMATES[h.waste_type] || 1);
    });
    const topMaterial = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      total,
      topMaterial: topMaterial[0],
      topMaterialCount: topMaterial[1],
      avgConfidence: (totalConfidence / total * 100).toFixed(1),
      co2Offset: totalCO2.toFixed(1),
      counts
    };
  }, [history]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
               <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            SCWM Intelligence
            </h1>
          </div>
          <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {[ { id: 'scan', icon: Camera, label: 'Scanner' }, { id: 'analytics', icon: PieChart, label: 'Analytics' } ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as 'scan' | 'analytics')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-inner shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="w-full p-6 lg:p-8 max-w-[1920px] mx-auto">
        
        {/* --- SCANNER TAB --- */}
        {activeTab === 'scan' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
              
              {/* Left: Interactive Upload Section */}
              <section className="space-y-6 flex flex-col">
                <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden min-h-[450px] flex flex-col justify-center items-center shadow-2xl">
                  {/* Decorative background glow */}
                  <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                  
                  {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center z-10 group-hover:scale-[1.02] transition-transform duration-500">
                       <img src={preview} className="rounded-2xl shadow-2xl max-h-[400px] w-auto object-contain border border-slate-700/50" />
                       <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                          <p className="text-white font-bold flex items-center gap-2 bg-slate-900 px-6 py-3 rounded-full border border-slate-700"><Upload className="w-4 h-4"/> Change Image</p>
                       </div>
                    </div>
                  ) : (
                    <div className="py-12 text-slate-500 z-10 space-y-4">
                      <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors duration-300">
                        <Upload className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-300">Upload Debris Image</h3>
                      <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">Drag and drop or click to upload JPG/PNG files for instant AI analysis.</p>
                    </div>
                  )}
                  <input type="file" onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </div>
                
                <button onClick={handleAnalyze} disabled={!file || loading} 
                  className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 text-lg tracking-wide border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
                  {loading ? <><div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"/> PROCESSING DATA...</> : <><BrainCircuit className="w-6 h-6" /> ANALYZE DEBRIS</>}
                </button>
              </section>

              {/* Right: Intelligence Hub (Result) */}
              <section className="flex flex-col h-full min-h-[450px]">
                {loading ? (
                  <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 h-full backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                       <h2 className="text-xl font-bold text-emerald-400">Processing Neural Inputs...</h2>
                    </div>
                    <AnalysisSkeleton />
                  </div>
                ) : result ? (
                  <div className="bg-slate-900/80 rounded-3xl p-1 border border-slate-800 h-full backdrop-blur-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                    
                    <div className="p-8 h-full flex flex-col gap-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                          <BrainCircuit className="w-6 h-6 text-emerald-400" /> 
                          AI Analysis Report
                        </h2>
                        {/* SUSTAINABILITY BADGE */}
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono border flex items-center gap-2 ${result.status?.includes('Recyclable') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                           {result.status?.includes('Recyclable') ? <Recycle className="w-3 h-3"/> : <RefreshCw className="w-3 h-3"/>}
                           {result.status || "PROCESSING"}
                        </span>
                      </div>

                      {/* Key Stats Row */}
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-4 duration-500 delay-100">
                        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Detected Material</p>
                          <p className="text-3xl font-extrabold text-white capitalize break-words leading-none">{result.waste_type.replace('_', ' ')}</p>
                        </div>
                        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Confidence Level</p>
                          <div className="flex items-end gap-2">
                             <p className="text-3xl font-extrabold text-emerald-400">{(result.confidence * 100).toFixed(0)}<span className="text-lg">%</span></p>
                             <div className="h-2 flex-1 bg-slate-700 rounded-full mb-2 ml-2 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Operational Guidelines Card (High Visibility) */}
                      <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 p-6 rounded-2xl border border-blue-500/20 relative group animate-in slide-in-from-right-4 duration-500 delay-200 hover:border-blue-500/40 transition-all">
                        <div className="absolute top-4 right-4 bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                           <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-blue-300 font-bold mb-3 text-sm uppercase tracking-wide">Operational Guidelines</h3>
                        <p className="text-blue-50 text-base leading-relaxed font-medium pr-8">{result.advice}</p>
                      </div>
                      
                      {/* Eco Fact Card */}
                      <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 p-6 rounded-2xl border border-emerald-500/20 relative group animate-in slide-in-from-right-4 duration-500 delay-300 hover:border-emerald-500/40 transition-all">
                         <div className="absolute top-4 right-4 bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                           <Lightbulb className="w-6 h-6 text-emerald-400" />
                        </div>
                         <p className="text-emerald-300 font-bold mb-3 text-sm uppercase tracking-wide">Environmental Impact Analysis</p>
                         <p className="text-emerald-50 text-sm italic leading-relaxed pr-8">{result.fact}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                    <div className="w-20 h-20 rounded-full bg-slate-800 mb-6 flex items-center justify-center animate-pulse">
                       <BrainCircuit className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-medium">Waiting for neural inputs...</p>
                    <p className="text-sm opacity-50 mt-2">Upload an image to begin analysis</p>
                  </div>
                )}
              </section>
            </div>

            {/* INTEGRATED MAP (Full Width) */}
            {result && (
              <div className="mt-16 space-y-6 animate-in zoom-in-95 duration-700 delay-300 border-t border-slate-800/50 pt-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <MapPin className="text-emerald-500 w-6 h-6" /> 
                      Authorized Disposal Centers
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                      Showing verified government and private facilities for <b>{result.waste_type.replace('_', ' ')}</b> in Bengaluru. 
                      Please contact centers before transport.
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-500/20 text-sm font-bold flex items-center gap-2">
                    {filteredCenters.length} Locations Found <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/50 ring-4 ring-slate-800/50">
                   <MapComponent centers={filteredCenters} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ANALYTICS DASHBOARD TAB --- */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-500">
            {historyLoading ? (
              <AnalyticsSkeleton />
            ) : stats ? (
              <div className="space-y-8">
                {/* ... (Analytics Content) ... */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-4 border-b border-slate-800">
                  <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">Sustainability Dashboard</h2>
                      <p className="text-slate-400 mt-2">Real-time analysis of your environmental impact footprint.</p>
                  </div>
                  <button onClick={() => { setHistoryLoading(true); axios.get('http://localhost:8000/history').then(res => setHistory(res.data)).finally(() => setTimeout(() => setHistoryLoading(false), 500)); }} className="text-sm font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-slate-700">
                    <History className="w-4 h-4" /> Refresh Data
                  </button>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Scans Card */}
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-bl-full transition-all group-hover:bg-blue-500/10"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Scans</p>
                    <p className="text-5xl font-black text-white mt-4 tracking-tight">{stats.total}</p>
                    <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 bg-slate-950/50 w-fit px-3 py-1 rounded-full">
                       <TrendingUp className="w-3 h-3 text-emerald-500" /> Database Active
                    </div>
                  </div>

                  {/* Dominant Material Card */}
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full transition-all group-hover:bg-emerald-500/10"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Dominant Debris</p>
                    <p className="text-4xl font-black text-white mt-4 capitalize tracking-tight">{stats.topMaterial.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500 mt-6">Detected in {Math.round((stats.topMaterialCount / stats.total) * 100)}% of scans</p>
                  </div>

                  {/* CO2 Offset Card */}
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-lg">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-bl-full transition-all group-hover:bg-purple-500/10"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. CO2 Offset</p>
                    <p className="text-5xl font-black text-white mt-4 tracking-tight">{stats.co2Offset} <span className="text-2xl text-slate-500 font-medium">kg</span></p>
                    <p className="text-xs text-slate-500 mt-6">Projected landfill diversion impact</p>
                  </div>
                </div>

                {/* Charts and Tables */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Composition Chart */}
                  <div className="lg:col-span-1 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                       <PieChart className="w-5 h-5 text-slate-400"/> Waste Composition
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(stats.counts).map(([type, count]) => (
                        <div key={type} className="group">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                              <span className="text-slate-300 capitalize flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${type === 'pvc' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : type === 'brick' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
                                {type.replace('_', ' ')}
                              </span>
                              <span className="text-slate-500">{Math.round((count / stats.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:scale-[1.02] ${type === 'pvc' ? 'bg-blue-500' : type === 'brick' ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${(count / stats.total) * 100}%` }}></div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* History Table */}
                  <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
                    <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                       <h3 className="font-bold text-white flex items-center gap-2">
                          <History className="w-5 h-5 text-slate-400" /> Recent Scan Log
                       </h3>
                    </div>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-5 pl-8">Material ID</th>
                            <th className="p-5">Type</th>
                            <th className="p-5">Confidence</th>
                            <th className="p-5">Timestamp</th>
                            <th className="p-5 pr-8 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {history.map((scan) => (
                            <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="p-5 pl-8 text-slate-500 text-xs font-mono group-hover:text-emerald-400 transition-colors">#{scan.id.toString().padStart(4, '0')}</td>
                              <td className="p-5 font-bold text-white capitalize">{scan.waste_type.replace('_', ' ')}</td>
                              <td className="p-5">
                                <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">{(scan.confidence * 100).toFixed(0)}%</span>
                              </td>
                              <td className="p-5 text-slate-500 text-sm">{new Date(scan.timestamp).toLocaleDateString()}</td>
                              <td className="p-5 pr-8 text-right"><span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide">Logged</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-slate-500 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                   <AlertCircle className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-300">No Data Available</h3>
                <p className="text-sm mt-2 opacity-60">Start by scanning debris images to build your analytics history.</p>
                <button onClick={() => setActiveTab('scan')} className="mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-900/20">
                   Go to Scanner
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}