import React, { useState, useEffect } from "react";
import { Award, Banknote, TrendingUp } from "lucide-react";
import { useWeb3 } from "./Web3Context";

const NeoBar = ({ percent, color, label }) => {
  return (
    <div className="w-full">
      {/* Progress Container */}
      <div className="w-full h-6 border-4 border-black rounded-md overflow-hidden bg-white">
        {/* Progress Fill */}
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {/* Label */}
      <p className="text-center font-black mt-1">{label}</p>
    </div>
  );
};

function LenderPage() {
  const { web3, contract, account } = useWeb3();
  const [lenderLoans, setLenderLoans] = useState([]);
  const [lenderXp, setLenderXp] = useState(0);
  const [totalEarned, setTotalEarned] = useState("0");

  useEffect(() => {
    async function loadLenderData() {
      if (!contract || !account) return;
      try {
        const xp = await contract.methods.lenderXP(account).call();
        setLenderXp(parseInt(Number(xp)));

        const loanIds = await contract.methods.getLenderLoans(account).call();
        const loaded = [];
        let earned = 0;
        for (let id of loanIds) {
          const loan = await contract.methods.loans(id).call();
          loaded.push(loan);
          if (Number(loan.state) === 2) {
            earned += parseFloat(web3.utils.fromWei(loan.repayAmount, "ether")) -
              parseFloat(web3.utils.fromWei(loan.requestedAmount, "ether"));
          }
        }
        setLenderLoans(loaded.reverse());
        setTotalEarned(earned.toFixed(4));
      } catch (err) {
        console.error("LenderPage:", err);
      }
    }
    loadLenderData();
  }, [contract, account, web3]);

  const settled = lenderLoans.filter(l => Number(l.state) === 2).length;
  const active = lenderLoans.filter(l => Number(l.state) === 1).length;

  return (
    <div className="space-y-8 z-10 relative pb-20">
      {/* Hero banner */}
      <div
        className="neo-card p-8 bg-[#FFE533] flex flex-wrap justify-between items-center gap-6 relative overflow-hidden group"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-15 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
          <Award size={160} />
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black uppercase tracking-tighter">Lender Vault</h2>
          <p className="font-bold bg-black text-[#FFE533] inline-block px-3 py-1 border-2 border-black mt-2 text-sm uppercase">
            Your Investment Portfolio
          </p>
        </div>
        <div className="relative z-10 flex gap-4 flex-wrap">
          {[
            { label: "Total XP", val: lenderXp, bg: "#000", text: "#FFE533" },
            { label: "Settled", val: settled, bg: "#4ADE80", text: "#000" },
            { label: "Active", val: active, bg: "#FF00FF", text: "#000" },
            { label: "Earned (ETH)", val: `+${totalEarned}`, bg: "#fff", text: "#000" }
          ].map(({ label, val, bg, text }) => (
            <div key={label} className="text-center border-4 border-black px-4 py-2 min-w-[80px]"
              style={{ backgroundColor: bg, color: text, boxShadow: "3px 3px 0 #000" }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: text === "#000" ? "#555" : text }}>{label}</p>
              <p className="text-2xl font-black">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div>
        <h3 className="text-2xl font-black uppercase mb-5 flex items-center gap-2">
          <Banknote size={28} className="text-[#4ADE80]" /> Active &amp; Settled Positions
        </h3>

        {lenderLoans.length === 0 ? (
          <div className="text-center font-black text-gray-300 p-20 border-8 border-dashed border-black bg-white uppercase text-2xl tracking-widest">
            📂 Portfolio Empty
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lenderLoans.map((loan) => {
              const stateLabels = ["Requested ⏱", "Funded 🟢", "Repaid ✅", "Defaulted ❌"];
              const totalRepayETH = web3 ? web3.utils.fromWei(loan.repayAmount, "ether") : "0";
              const fundedETH = web3 ? web3.utils.fromWei(loan.requestedAmount, "ether") : "0";
              const repaidNum = Number(loan.amountRepaid);
              const totalNum = Number(loan.repayAmount);
              const pct = totalNum > 0 ? Math.min(100, (repaidNum / totalNum) * 100) : 0;
              const barColor = pct >= 100 ? "#4ADE80" : "#00FFFF";
              const isSettled = Number(loan.state) === 2;
              const headerBg = isSettled ? "#4ADE80" : "#f3f4f6";

              return (
                <div
                  key={Number(loan.id)}
                  className="flex flex-col bg-white border-4 border-black overflow-hidden hover:-translate-y-1 transition-transform"
                  style={{ boxShadow: "5px 5px 0 #000" }}
                >
                  {/* Header */}
                  <div className="px-5 py-3 border-b-4 border-black font-black flex justify-between items-center"
                    style={{ backgroundColor: headerBg }}>
                    <span className="bg-black text-white px-2 py-0.5 font-black text-sm">#{Number(loan.id)}</span>
                    <span className="text-xs font-black uppercase">{stateLabels[loan.state]}</span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4 flex-grow">
                    <div className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Funded</p>
                        <p className="text-2xl font-black">{fundedETH} ETH</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Expected Return</p>
                        <p className="font-black bg-[#4ADE80] px-2 py-0.5 border-2 border-black inline-block text-sm">
                          {totalRepayETH} ETH
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-[9px] font-black uppercase mb-1.5">
                        <span>Yield Progress</span>
                        <span className="bg-[#FFE533] border-2 border-black px-1.5">{Math.round(pct)}%</span>
                      </div>
                      <NeoBar percent={pct} color={barColor} height="h-8" label={`${Math.round(pct)}% COLLECTED`} />
                    </div>

                    {isSettled && (
                      <div className="flex items-center gap-2 text-xs font-black text-[#15803d] uppercase bg-[#dcfce7] border-2 border-[#4ADE80] px-3 py-2">
                        <TrendingUp size={14} />
                        +{(parseFloat(totalRepayETH) - parseFloat(fundedETH)).toFixed(4)} ETH profit
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 border-t-4 border-black px-4 py-2 text-[9px] font-bold truncate text-gray-400">
                    Borrower: {loan.borrower}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LenderPage;
