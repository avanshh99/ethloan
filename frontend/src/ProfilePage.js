import React, { useState, useEffect } from "react";
import { User, Medal, ArrowUpCircle, Trophy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

function ProfilePage() {
  const { web3, contract, account } = useWeb3();
  const [stats, setStats] = useState({ creditScore: 0, lenderXP: 0, totalBorrowed: 0, totalLent: 0 });
  const { creditScore, lenderXP } = stats;

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function loadStats() {
      if (!contract || !account) return;
      try {
        const score = await contract.methods.getCreditScore(account).call();
        const xp = await contract.methods.lenderXP(account).call();

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const timeline = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          timeline.push({
            name: monthNames[d.getMonth()],
            monthNum: d.getMonth(),
            year: d.getFullYear(),
            borrowed: 0,
            lent: 0
          });
        }

        const borrowIds = await contract.methods.getBorrowerLoans(account).call();
        const lendIds = await contract.methods.getLenderLoans(account).call();

        let bVol = 0, lVol = 0;

        for (let id of borrowIds) {
          const l = await contract.methods.loans(id).call();
          if (Number(l.state) > 0) { // Only count if actually funded
            const pAmount = parseFloat(web3.utils.fromWei(l.requestedAmount, "ether"));
            bVol += pAmount;

            const cd = new Date(Number(l.createdAt) * 1000);
            const tMatch = timeline.find(t => t.monthNum === cd.getMonth() && t.year === cd.getFullYear());
            if (tMatch) tMatch.borrowed += pAmount;
          }
        }

        for (let id of lendIds) {
          const l = await contract.methods.loans(id).call();
          const pAmount = parseFloat(web3.utils.fromWei(l.requestedAmount, "ether"));
          lVol += pAmount;

          const cd = new Date(Number(l.createdAt) * 1000);
          const tMatch = timeline.find(t => t.monthNum === cd.getMonth() && t.year === cd.getFullYear());
          if (tMatch) tMatch.lent += pAmount;
        }

        setChartData(timeline);
        setStats({
          creditScore: parseInt(Number(score)),
          lenderXP: parseInt(Number(xp)),
          totalBorrowed: bVol.toFixed(2),
          totalLent: lVol.toFixed(2)
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [contract, account, web3]);

  const getRank = (xp) => xp >= 100 ? "Whale 🐋" : xp >= 50 ? "Pro Lender 📈" : "Newbie 🐥 ";
  const scoreColor = (s) => s >= 80 ? "#4ADE80" : s >= 50 ? "#FFE533" : "#EF4444";

  return (
    <div className="space-y-8 z-10 relative pb-20">
      {/* Header */}
      <div className="neo-card p-8 bg-white flex flex-wrap justify-between items-start gap-6"
        style={{ boxShadow: "6px 6px 0 #000" }}>
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl font-black uppercase mb-3 flex items-center gap-4">
            <User size={40} className="text-[#4ADE80] shrink-0" /> Identity &amp; Reputation
          </h2>
          <div className="bg-black text-white px-4 py-2 border-2 border-black font-mono text-sm inline-block max-w-full overflow-hidden">
            <span className="truncate block">{account}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-l font-black uppercase text-gray-400 mb-2">Current Rank</p>
          <div
            className="text-2xl font-black bg-[#be23c6ff] px-5 py-3 border-4 border-black inline-block transform rotate-1"
            style={{ boxShadow: "3px 3px 0 #000" }}
          >
            {getRank(lenderXP)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credit Score */}
        <div className="neo-card p-8 bg-white border-4 border-black relative overflow-hidden"
          style={{ boxShadow: "6px 6px 0 #000" }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00FFFF] opacity-10 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 relative z-10">
            <Medal size={24} /> Credit Score
          </h3>
          <div className="flex items-end gap-2 mb-5 relative z-10">
            <span className="text-8xl font-black leading-none">{creditScore}</span>
            <span className="text-xl font-bold text-gray-400 mb-1">/ 100</span>
          </div>
          {/* Invisible spacer to exactly align progress bars vertically */}
          <div className="flex justify-between text-[11px] font-black uppercase text-gray-400 mb-1 relative z-10 invisible">
            <span>ALIGNMENT</span>
          </div>
          <NeoBar
            percent={creditScore}
            color={scoreColor(creditScore)}
            height="h-10"
            label={`${creditScore} / 100`}
          />
          <p className="mt-3 text-sm font-bold text-gray-500 relative z-10">Higher scores unlock lower interest rates.</p>
        </div>

        {/* Lender XP */}
        <div className="neo-card p-8 bg-white border-4 border-black relative overflow-hidden"
          style={{ boxShadow: "6px 6px 0 #000" }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF00FF] opacity-10 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 relative z-10">
            <Trophy size={24} /> Lending XP
          </h3>
          <div className="flex items-end gap-2 mb-5 relative z-10">
            <span className="text-8xl font-black leading-none">{lenderXP}</span>
            <span className="text-xl font-bold text-gray-400 mb-1 uppercase">Pts</span>
          </div>
          {/* XP tier markers */}
          <div className="flex justify-between text-[11px] font-black uppercase text-gray-400 mb-1 relative z-10">
            <span>Newbie</span><span>Pro (50)</span><span>Whale (100)</span>
          </div>
          <NeoBar
            percent={lenderXP}
            color="#d65ccaff"
            height="h-10"
            label={`${lenderXP} / 100 XP`}
          />
          <p className="mt-3 text-sm font-bold text-gray-500 relative z-10">Fund loans to earn XP and level up.</p>
        </div>
      </div>

      {/* Volume Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Borrowed", val: stats.totalBorrowed + " ETH", bg: "#be23c6ff" },
          { label: "Total Lent", val: stats.totalLent + " ETH", bg: "#00FFFF" },
          { label: "Credit Score", val: creditScore + " / 100", bg: "#FFE533" },
          { label: "Lender Rank", val: getRank(lenderXP), bg: "#4ADE80" },
        ].map(({ label, val, bg }) => (
          <div key={label} className="border-4 border-black p-4 text-center bg-white"
            style={{ boxShadow: "3px 3px 0 #000" }}>
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">{label}</p>
            <p className="text-lg font-black">
              <span className="px-2 py-0.5 border-2 border-black" style={{ backgroundColor: bg }}>{val}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="neo-card p-8 bg-white border-4 border-black"
        style={{ boxShadow: "6px 6px 0 #000" }}>
        <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
          <ArrowUpCircle size={28} /> Transaction Analytics
        </h3>
        <div className="w-full h-[320px] border-4 border-black bg-gray-50 pr-4 pt-6 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
              <XAxis dataKey="name" stroke="#000" tick={{ fill: "#000", fontWeight: "bold", fontSize: 13 }} tickMargin={12} />
              <YAxis stroke="#000" tick={{ fill: "#000", fontWeight: "bold", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "4px solid #000", borderRadius: 0, boxShadow: "4px 4px 0 #000", fontWeight: "bold" }}
              />
              <Area type="step" dataKey="borrowed" stroke="#000" strokeWidth={3} fill="#80BDFB" fillOpacity={1} />
              <Area type="step" dataKey="lent" stroke="#000" strokeWidth={3} fill="#FFE533" fillOpacity={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-8 mt-5 justify-center">
          <div className="flex items-center gap-2 font-bold text-sm">
            <div className="w-4 h-4 border-2 border-black bg-[#80BDFB]" />
            <span>Borrowed Volume</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm">
            <div className="w-4 h-4 border-2 border-black bg-[#FFE533]" />
            <span>Lent Volume</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
