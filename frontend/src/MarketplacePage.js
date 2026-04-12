import React, { useState, useEffect } from "react";
import { Coins, AlertTriangle, ShieldCheck, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "./Web3Context";

function MarketplacePage() {
  const { web3, contract, account } = useWeb3();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadAllLoans = async () => {
    if (!contract || !web3) return;
    setLoading(true);
    try {
      const loanCount = Number(await contract.methods.nextLoanId().call());
      const active = [];
      for (let i = 1; i < loanCount; i++) {
        const loan = await contract.methods.loans(i).call();
        if (Number(loan.state) === 0) {
          const score = await contract.methods.getCreditScore(loan.borrower).call();
          active.push({ ...loan, creditScore: Number(score) });
        }
      }
      setLoans(active);
    } catch (err) {
      // Only show a non-intrusive console error — skip noisy toast
      console.error("Marketplace load error:", err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    loadAllLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, web3]);

  const handleFund = async (loanId, amount) => {
    if (!account) return toast.error("Wallet not connected.");
    try {
      toast.info("Awaiting MetaMask confirmation…");
      await contract.methods.fundLoan(loanId).send({ from: account, value: amount });
      toast.success("Loan funded! 🎉");
      setLoans((prev) => prev.filter((l) => Number(l.id) !== Number(loanId)));
    } catch (err) {
      console.error(err);
      if (err.code !== 4001) toast.error("Funding failed. " + (err.message || ""));
    }
  };

  const riskBg = (s) => (s >= 80 ? "#4ADE80" : s >= 50 ? "#FFE533" : "#EF4444");
  const riskLabel = (s) => (s >= 80 ? "LOW RISK" : s >= 50 ? "MED RISK" : "HIGH RISK");
  const fmtDur = (secs) => {
    const s = Number(secs);
    if (s >= 604800) return `${Math.round(s / 604800)}w`;
    if (s >= 86400) return `${Math.round(s / 86400)}d`;
    if (s >= 3600) return `${Math.round(s / 3600)}h`;
    return `${s}s`;
  };

  return (
    <div className="space-y-8 z-10 relative">
      {/* Header */}
      <div className="neo-card p-8 bg-white flex flex-wrap justify-between items-center gap-4" style={{ boxShadow: "6px 6px 0 #000" }}>
        <div>
          <h2 className="text-4xl font-black uppercase mb-2 flex items-center gap-4">
            <Coins size={40} className="text-[#00FFFF]" /> Loan Marketplace
          </h2>
          <p className="text-base font-bold bg-black text-white inline-block px-4 py-2 border-2 border-black">
            Global Liquidity Pool · Fund. Earn. Repeat.
          </p>
        </div>
        <button
          onClick={loadAllLoans}
          disabled={loading}
          className="flex items-center gap-2 font-black uppercase text-sm px-5 py-3 border-4 border-black bg-[#FFE533] hover:bg-[#FCD34D] transition-colors active:translate-x-0.5 active:translate-y-0.5"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-[#00FFFF] border-4 border-black px-5 py-2 font-black text-sm uppercase" style={{ boxShadow: "3px 3px 0 #000" }}>
          {loans.length} Open Request{loans.length !== 1 ? "s" : ""}
        </div>
        <div className="bg-white border-4 border-black px-5 py-2 font-bold text-sm uppercase text-gray-500" style={{ boxShadow: "3px 3px 0 #000" }}>
          {loans.filter(l => l.creditScore >= 80).length} Low Risk
        </div>
        <div className="bg-[#EF4444] text-white border-4 border-black px-5 py-2 font-black text-sm uppercase" style={{ boxShadow: "3px 3px 0 #000" }}>
          {loans.filter(l => l.creditScore < 50).length} High Risk
        </div>
      </div>

      {/* Content */}
      {loading && !initialized ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-4 border-black h-64 bg-gray-100 animate-pulse" style={{ boxShadow: "4px 4px 0 #000" }} />
          ))}
        </div>
      ) : !initialized ? (
        <div className="text-xl font-black text-center border-4 border-black p-12 bg-white uppercase tracking-widest"
          style={{ boxShadow: "4px 4px 0 #000" }}>
          Connect your wallet to view loans.
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center border-8 border-dashed border-black p-16 bg-white">
          <p className="text-4xl mb-4">🏜️</p>
          <p className="font-black text-2xl uppercase tracking-widest text-gray-400">No Active Requests</p>
          <p className="font-bold text-gray-400 mt-2">Check back soon or ask a borrower to create a request.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => {
            const isSelf = account && loan.borrower &&
              account.toLowerCase() === loan.borrower.toLowerCase();
            const bg = riskBg(loan.creditScore);

            return (
              <div
                key={Number(loan.id)}
                className="flex flex-col justify-between overflow-hidden bg-white border-4 border-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 group"
                style={{ boxShadow: "5px 5px 0 #000" }}
              >
                {/* Risk badge header */}
                <div
                  className="px-5 py-3 border-b-4 border-black font-black flex justify-between items-center"
                  style={{ backgroundColor: bg }}
                >
                  <span className="flex items-center gap-2 text-sm uppercase">
                    {loan.creditScore >= 50 ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                    Score {loan.creditScore} · {riskLabel(loan.creditScore)}
                  </span>
                  <span className="bg-white text-black px-2 py-0.5 border-2 border-black text-xs font-black uppercase">
                    {fmtDur(loan.duration)}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4 flex-grow">
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Lending Amount</p>
                    <p className="text-3xl font-black group-hover:scale-105 transition-transform origin-left">
                      {web3.utils.fromWei(loan.requestedAmount, "ether")} ETH
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Interest Rate</p>
                      <p
                        className="text-xl font-black px-2 py-0.5 inline-block border-2 border-black"
                        style={{ backgroundColor: "#00FFFF" }}
                      >
                        {Number(loan.interestRate)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Collateral</p>
                      <p className="text-base font-black">
                        {web3.utils.fromWei(loan.collateralAmount, "ether")} ETH
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] bg-gray-100 px-3 py-2 border-2 border-black font-mono truncate text-gray-400">
                    {loan.borrower}
                  </div>
                </div>

                {/* CTA */}
                {isSelf ? (
                  <div className="w-full bg-gray-100 text-gray-400 font-black text-sm py-4 border-t-4 border-black text-center uppercase tracking-widest cursor-not-allowed">
                    Your Request
                  </div>
                ) : (
                  <button
                    onClick={() => handleFund(loan.id, loan.requestedAmount)}
                    className="w-full bg-[#FFE533] text-black font-black text-lg py-4 border-t-4 border-black flex justify-center items-center gap-2 hover:bg-[#FCD34D] active:bg-[#F59E0B] transition-colors uppercase tracking-wider"
                  >
                    FUND LOAN <ChevronRight size={20} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
