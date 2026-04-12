import "./App.css";
import React from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

import LenderPage from "./LenderPage";
import BorrowerPage from "./BorrowerPage";
import MarketplacePage from "./MarketplacePage";
import ProfilePage from "./ProfilePage";
import LandingPage from "./LandingPage";

import { useWeb3 } from "./Web3Context";

import { Bitcoin, Coins, Layers, Link as LinkIcon, Orbit, ShieldCheck, Database, Box, Cpu } from "lucide-react";
import { Toaster } from 'sonner';

function FloatingIcons() {
  return (
    <>
      <div className="floating-icon-wrapper top-10 left-10 animate-float-slow text-neoMain opacity-30"><Bitcoin size={120} /></div>
      <div className="floating-icon-wrapper top-40 right-20 animate-float-fast text-neoPink opacity-40"><Coins size={96} /></div>
      <div className="floating-icon-wrapper bottom-32 left-1/4 animate-float-slow text-neoBlue opacity-30" style={{ animationDelay: '1s' }}><Layers size={110} /></div>
      <div className="floating-icon-wrapper top-1/3 right-1/3 animate-float-fast text-neoGreen opacity-40" style={{ animationDelay: '2s' }}><LinkIcon size={80} /></div>
      <div className="floating-icon-wrapper bottom-10 right-1/4 animate-float-slow text-yellow-500 opacity-20" style={{ animationDelay: '0.5s' }}><Orbit size={140} /></div>
      <div className="floating-icon-wrapper top-20 right-1/2 animate-float-fast text-neoPink opacity-20" style={{ animationDelay: '1.2s' }}><ShieldCheck size={90} /></div>
      <div className="floating-icon-wrapper bottom-20 left-10 animate-float-slow text-neoMain opacity-30" style={{ animationDelay: '2.5s' }}><Database size={100} /></div>
      <div className="floating-icon-wrapper top-60 left-1/4 animate-float-fast text-neoBlue opacity-20" style={{ animationDelay: '0.8s' }}><Box size={85} /></div>
      <div className="floating-icon-wrapper top-10 right-60 animate-float-slow text-neoGreen opacity-30" style={{ animationDelay: '1.8s' }}><Cpu size={105} /></div>
    </>
  );
}

function NavMenu() {
  const { account, connectWallet } = useWeb3();
  const location = useLocation();
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (account) {
      navigate("/marketplace");
      return;
    }
    const success = await connectWallet();
    if (success && location.pathname === "/") {
       navigate("/marketplace");
    }
  };

  if (location.pathname === "/") {
    return (
      <div className="text-center pb-8 z-10 relative">
        <button 
          onClick={handleConnect} 
          className="bg-[#FFE533] border-4 border-black text-black font-black text-2xl px-12 py-6 uppercase tracking-widest transition-all hover:bg-[#FCD34D] hover:-translate-y-1 active:translate-y-1 active:translate-x-1 focus:outline-none"
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
          {account ? "Enter DAPP" : "Connect MetaMask"}
        </button>
      </div>
    );
  }

  return (
    <nav className="neo-card flex justify-center space-x-6 p-4 mb-8 bg-white border-4 border-black relative z-10 w-max mx-auto px-8 flex-wrap gap-y-4">
      <Link to="/marketplace" className={`font-black text-xl px-4 py-2 uppercase border-2 border-transparent transition-all hover:bg-neoBlue hover:border-black ${location.pathname === '/marketplace' ? 'bg-neoBlue border-black' : 'text-black'}`}>Marketplace</Link>
      <Link to="/borrower" className={`font-black text-xl px-4 py-2 uppercase border-2 border-transparent transition-all hover:bg-neoPurple hover:border-black ${location.pathname === '/borrower' ? 'bg-neoPurple border-black' : 'text-black'}`}>Borrower Vault</Link>
      <Link to="/lender" className={`font-black text-xl px-4 py-2 uppercase border-2 border-transparent transition-all hover:bg-neoMain hover:border-black ${location.pathname === '/lender' ? 'bg-neoMain border-black' : 'text-black'}`}>Lender Portfolio</Link>
      <Link to="/profile" className={`font-black text-xl px-4 py-2 uppercase border-2 border-transparent transition-all hover:bg-neoGreen hover:border-black ${location.pathname === '/profile' ? 'bg-neoGreen border-black' : 'text-black'}`}>On-Chain Profile</Link>

      <div className="flex items-center ml-8 pl-8 border-l-4 border-black">
        <div className="bg-black text-white px-3 py-2 font-bold text-sm truncate max-w-[180px] border-2 border-neoPink shadow-neo-sm">
          {account ? `${account.substring(0, 6)}...${account.substring(38)}` : "NOT CONNECTED"}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const { account } = useWeb3();
  const location = useLocation();

  return (
    <div className="neo-grid-bg min-h-screen relative overflow-x-hidden font-sans border-t-8 border-black">
      <FloatingIcons />

      <Toaster
        position="bottom-right"
        duration={3000}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'w-fit h-fit flex items-center gap-3 px-5 py-3 border-4 border-black shadow-neo font-bold text-lg rounded-sm transition-all',
            success: 'bg-[#4ADE80] text-black',
            error: 'bg-[#EF4444] text-white',
            info: 'bg-white text-black'
          }
        }}
      />

      <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <header className="mb-10 text-center">
          <Link to="/">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 cursor-pointer hover:scale-105 transition-transform inline-block" style={{ textShadow: '4px 4px 0 #000', color: '#FFDF00' }}>
              <span className="text-white">Eth</span>Loan
            </h1>
          </Link>
        </header>

        <NavMenu />

        <div className="mb-6">
          {!account && window.location.pathname !== "/" ? (
            <div className="text-center font-black text-3xl p-12 bg-white border-4 border-black shadow-neo">
              Access Denied. <br /><span className="text-xl text-gray-500 mt-4 block">Please connect your MetaMask wallet.</span>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/lender" element={<LenderPage />} />
              <Route path="/borrower" element={<BorrowerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;