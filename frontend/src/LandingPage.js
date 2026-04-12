import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Coins } from "lucide-react";

function LandingPage() {
  return (
    <div className="text-center mt-12 max-w-4xl mx-auto z-10 relative space-y-12 animate-fade-in pb-20">
      
      {/* Hero Section */}
      <div className="neo-card bg-neoMain p-10 transform -rotate-1 hover:rotate-0 transition-transform duration-300 relative">
        <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 bg-white border-4 border-black font-black text-2xl shadow-neo rotate-6 z-20">
          WEB3 READY
        </div>
        <h2 className="text-5xl md:text-7xl font-black uppercase mb-6 leading-tight tracking-tighter" style={{ textShadow: '4px 4px 0 #FFF' }}>
          Unleash Financial Autonomy.
        </h2>
        <div className="bg-white border-4 border-black p-4 inline-block font-bold text-2xl shadow-neo-sm transform mt-4 mb-8">
          The ultimate Gamified lending protocol.
        </div>
      </div>
      
      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card bg-white p-6 border-4 border-black text-left group hover:-translate-y-2 transition-transform">
          <div className="bg-neoPink w-16 h-16 border-4 border-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Coins size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase mb-2">Fund & Earn</h3>
          <p className="font-bold text-gray-600">Fund loans on the open marketplace to earn lucrative fixed interest.</p>
        </div>

        <div className="neo-card bg-white p-6 border-4 border-black text-left group hover:-translate-y-2 transition-transform" style={{ transitionDelay: '50ms' }}>
          <div className="bg-neoBlue w-16 h-16 border-4 border-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase mb-2">Level Up XP</h3>
          <p className="font-bold text-gray-600">Gain reputation XP and climb the lender ranks to Whale status.</p>
        </div>

        <div className="neo-card bg-white p-6 border-4 border-black text-left group hover:-translate-y-2 transition-transform" style={{ transitionDelay: '100ms' }}>
          <div className="bg-neoGreen w-16 h-16 border-4 border-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase mb-2">Build Credit</h3>
          <p className="font-bold text-gray-600">Repay on time to boost your on-chain credit score and lower interest rates.</p>
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
