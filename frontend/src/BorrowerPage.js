import React, { useState, useEffect } from "react";
import { UserCircle, Coins, HeartPulse, BadgeCheck, PlusCircle, CheckCircle2, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "./Web3Context";


const NeoBar = ({ percent, color, label }) => {
  return (
    <div className="w-full">

      {/* Progress Container */}
<div className="w-full h-6 border-4 border-black rounded-md overflow-hidden bg-white relative">

        {/* Progress Fill */}
        <div
          className="h-full transition-all duration-500 absolute left-0 top-0"
          style={{
            width: `${percent}%`,
            backgroundColor: color || "yellow",
            display: "block",
            zIndex: 10 
          }}
        />
      </div>

      {/* Label */}
      <p className="text-center font-black mt-1">{label}</p>
    </div>
  );
};

function BorrowerPage() {
  const { web3, contract, account } = useWeb3();
  const [borrowerLoans, setBorrowerLoans] = useState([]);
  const [loanAmount, setLoanAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [duration, setDuration] = useState("3600");
  const [creditScore, setCreditScore] = useState(50);
  const [repayAmounts, setRepayAmounts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBorrowerData() {
      if (!contract || !account) return;
      try {
        const score = await contract.methods.getCreditScore(account).call();
        setCreditScore(Number(score));
        const loanIds = await contract.methods.getBorrowerLoans(account).call();
        const loaded = [];
        for (let id of loanIds) {
          const loan = await contract.methods.loans(id).call();
          loaded.push(loan);
        }
        setBorrowerLoans(loaded.reverse());
      } catch (err) {
        console.error("loadBorrowerData:", err);
      }
    }
    loadBorrowerData();
  }, [contract, account]);

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!loanAmount || !collateralAmount) return toast.error("Fill all fields.");
    if (parseFloat(collateralAmount) < parseFloat(loanAmount) / 2)
      return toast.error("Collateral must be ≥ 50% of loan.");
    try {
      setLoading(true);
      toast.info("Awaiting MetaMask…");
      const weiAmt = web3.utils.toWei(loanAmount, "ether");
      const weiCol = web3.utils.toWei(collateralAmount, "ether");
      await contract.methods.requestLoan(weiAmt, parseInt(duration)).send({ from: account, value: weiCol });
      toast.success("Loan requested!");
      window.location.reload();
    } catch (err) {
      toast.error("Transaction failed: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async (loanId) => {
    const amount = repayAmounts[loanId];
    if (!amount) return toast.error("Enter repay amount.");
    try {
      toast.info("Processing repayment…");
      
      const loan = borrowerLoans.find(l => l.id.toString() === loanId.toString());
      const totalRepayETH = web3.utils.fromWei(loan.repayAmount, "ether");
      const repaidETH = web3.utils.fromWei(loan.amountRepaid, "ether");
      const remainingDebt = Number(totalRepayETH) - Number(repaidETH);
      const inputAmount = Number(amount);

      await contract.methods.repayLoan(loanId).send({
        from: account,
        value: web3.utils.toWei(amount, "ether")
      });

      if (inputAmount > remainingDebt) {
        const excess = (inputAmount - remainingDebt).toFixed(4);
        toast.success(`Repayment successful! Excess of ${excess} ETH was safely refunded to your wallet!`, {
          duration: 6000,
        });
      } else {
        toast.success("Repayment successful!");
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 3500);
      
    } catch (err) {
      toast.error("Repayment failed: " + err.message);
    }
  };

  const scoreColor = (s) => (s >= 80 ? "#4ADE80" : s >= 50 ? "#FFE533" : "#EF4444");
  const scoreLabel = (s) => (s >= 80 ? "EXCELLENT" : s >= 50 ? "FAIR" : "CRITICAL");

  return (
    <div className="space-y-8 z-10 relative pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── LEFT: Request Form ─────────────────────────────── */}
        <div className="lg:col-span-4 space-y-0">
          <div className="neo-card p-8 bg-white overflow-hidden relative" style={{ boxShadow: "6px 6px 0 #000" }}>
            <div className="absolute -top-6 -right-6 opacity-5 rotate-12 pointer-events-none text-black">
              <PlusCircle size={120} />
            </div>

            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 relative z-10">
              <span className="bg-[#B233FF] p-2 border-2 border-black inline-flex">
                <UserCircle size={28} />
              </span>
              New Request
            </h3>

            <form onSubmit={handleRequestLoan} className="space-y-4 relative z-10">
              {[
                { label: "Borrow Amount (ETH)", val: loanAmount, set: setLoanAmount, badge: null },
                { label: "Collateral (ETH)", val: collateralAmount, set: setCollateralAmount, badge: "MIN 50%" }
              ].map(({ label, val, set, badge }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-black uppercase text-xs tracking-wider">{label}</label>
                    {badge && <span className="bg-black text-[#FFE533] px-2 py-0.5 text-[9px] font-black border border-black">{badge}</span>}
                  </div>
                  <input
                    type="number" step="0.001" min="0" required
                    className="w-full border-4 border-black p-3 font-black text-2xl focus:outline-none focus:bg-gray-50 bg-white"
                    style={{ boxShadow: "3px 3px 0 #000" }}
                    placeholder="0.00"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                  />
                </div>
              ))}

              <div>
                <label className="font-black uppercase text-xs tracking-wider block mb-1">Duration</label>
                <select
                  className="w-full border-4 border-black p-3 font-black text-lg focus:outline-none bg-white"
                  style={{ boxShadow: "3px 3px 0 #000" }}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="3600"> 1 Hour</option>
                  <option value="86400"> 24 Hours</option>
                  <option value="604800"> 7 Days</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00FFFF] text-black font-black text-lg py-4 border-4 border-black uppercase tracking-wider mt-2 hover:bg-[#67e8f9] transition-colors active:translate-x-1 active:translate-y-1"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                {loading ? "Submitting…" : "Submit Request"}
              </button>
            </form>

            {/* Credit Health */}
            <div className="mt-8 pt-6 border-t-4 border-black">
              <div className="flex items-center justify-between mb-2">
                <p className="font-black uppercase text-xs flex items-center gap-2">
                  <HeartPulse size={16} className="text-[#EF4444]" />
                  Credit Health
                </p>
                <span
                  className="px-2 py-0.5 border-2 border-black font-black text-[10px]"
                  style={{ backgroundColor: scoreColor(creditScore) }}
                >
                  {scoreLabel(creditScore)}
                </span>
              </div>
              <NeoBar
                percent={creditScore}
                color={scoreColor(creditScore)}
                label={`${creditScore}%`}
              />
              <p className="text-[11px] font-bold text-gray-400 uppercase mt-1.5 tracking-wide">Affects your interest rate</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Vault Dashboard ─────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Banner */}
          <div
            className="neo-card p-10 bg-[#4ADE80] group overflow-hidden relative"
            style={{ boxShadow: "8px 8px 0 #000" }}
          >
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-105 group-hover:rotate-6 transition-all duration-700 pointer-events-none">
              <Coins size={260} />
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl font-black uppercase mb-3 tracking-tighter">Vault Dashboard</h2>
              <div className="flex gap-2 flex-wrap">
                <span className="font-bold bg-white px-3 py-1 border-2 border-black text-sm uppercase">Active Debt</span>
                <span className="font-bold bg-black text-white px-3 py-1 border-2 border-black text-sm uppercase">On-Chain</span>
                <span className="font-bold bg-[#FFE533] px-3 py-1 border-2 border-black text-sm uppercase">
                  {borrowerLoans.length} Position{borrowerLoans.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Loan Cards */}
          {borrowerLoans.length === 0 ? (
            <div className="text-center font-black text-gray-300 p-20 border-8 border-dashed border-black bg-white uppercase text-2xl tracking-widest">
              Vault Empty
            </div>
          ) : (
            borrowerLoans.map((loan) => {
              const states = ["PENDING FUNDING ⏱️", "ACTIVE DEBT 🟢", "SETTLED ✅", "LIQUIDATED 💀"];
              const totalRepay = web3 ? web3.utils.fromWei(loan.repayAmount, "ether") : "0";
              const repaid = web3 ? web3.utils.fromWei(loan.amountRepaid, "ether") : "0";
              const totalN = Number(loan.repayAmount);
              const repaidN = Number(loan.amountRepaid);
              const pct = totalN > 0 ? Math.min(100, (repaidN / totalN) * 100) : 0;
              const isActive = loan.state.toString() === "1";
              const isSettled = loan.state.toString() === "2";
              const barColor = pct >= 100 ? "#4ADE80" : "#FF00FF";

              return (
                <div
                  key={Number(loan.id)}
                  className="bg-white border-4 border-black overflow-hidden hover:-translate-y-0.5 hover:shadow-2xl transition-all"
                  style={{ boxShadow: "6px 6px 0 #000" }}
                >
                  {/* Header */}
                  <div className={`px-6 py-4 border-b-4 border-black flex items-center gap-3 ${isSettled ? "bg-[#4ADE80]" : "bg-gray-50"}`}>
                    <span className="bg-black text-white px-3 py-1 font-black text-lg">#{Number(loan.id)}</span>
                    <span className="font-black uppercase text-base tracking-tight">{states[loan.state]}</span>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                    {/* Debt + Collateral */}
                    <div className="grid grid-cols-2 gap-4 pb-5 border-b-2 border-dashed border-gray-200">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Total Debt Owed</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black">{totalRepay}</span>
                          <span className="text-sm font-black text-gray-400">ETH</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Collateral</p>
                        <div
                          className={`${isSettled ? "bg-gray-200" : "bg-[#FFE533]"} px-3 py-1.5 border-4 border-black inline-block`}
                          style={{ boxShadow: "2px 2px 0 #000" }}
                        >
                          <span className="text-xl font-black">
                            {isSettled ? "RETURNED" : `${web3 ? web3.utils.fromWei(loan.collateralAmount, "ether") : "0"} ETH`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-black uppercase">
                        <span>Repayment Progress</span>
                        <span className="bg-[#FFE533] px-2 py-0.5 border-2 border-black">
                          {Number(repaid) > Number(totalRepay) ? totalRepay : repaid} / {totalRepay} ETH
                        </span>
                      </div>
                      <NeoBar
                        percent={pct}
                        color={barColor}
                        height="h-10"
                        label={`${Math.floor(pct)}% PAID`}
                      />
                    </div>

                    {/* Repay Input */}
                    {isActive && (
                      <div className="flex gap-3 items-stretch pt-1">
                        <input
                          type="number" step="0.001" min="0"
                          placeholder="Enter ETH to repay"
                          className="flex-1 border-4 border-black p-3 font-black text-lg focus:outline-none bg-white"
                          style={{ boxShadow: "2px 2px 0 #000" }}
                          value={repayAmounts[loan.id] || ""}
                          onChange={(e) => setRepayAmounts({ ...repayAmounts, [loan.id]: e.target.value })}
                        />
                        <button
                          onClick={() => handleRepay(loan.id)}
                          className="px-4 bg-[#4ADE80] border-4 border-black font-black text-base uppercase hover:bg-[#22c55e] transition-colors active:translate-x-0.5 active:translate-y-0.5"
                          style={{ boxShadow: "3px 3px 0 #000" }}
                        >
                          REPAY
                        </button>
                      </div>
                    )}

                    {isSettled && (
                      <div className="bg-[#4ADE80] p-5 border-4 border-black font-black uppercase text-xl text-center flex justify-center items-center gap-3">
                        <BadgeCheck size={28} /> Debt Cleared — Collateral Returned
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowerPage;