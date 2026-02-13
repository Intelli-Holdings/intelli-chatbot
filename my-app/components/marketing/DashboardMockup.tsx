export function DashboardMockup() {
  return (
    <div className="w-full max-w-[1000px] mx-auto mt-16 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-0.5 animate-pulse-glow-blue">
      <div className="rounded-[14px] overflow-hidden bg-[#0a0f1e]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-8">
            <div className="bg-white/[0.06] rounded-md px-3 py-1.5 text-xs text-white/30 font-mono">
              app.intelliconcierge.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex min-h-[320px]">
          {/* Sidebar */}
          <div className="w-[200px] border-r border-white/[0.06] py-4 px-3 hidden md:block">
            <div className="flex items-center gap-2 px-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-dreamBlue to-cyan-400" />
              <span className="text-sm font-semibold text-white/80">Intelli</span>
            </div>
            {[
              { label: "Dashboard", active: true },
              { label: "Conversations", active: false },
              { label: "Campaigns", active: false },
              { label: "AI Assistant", active: false },
              { label: "Analytics", active: false },
              { label: "Channels", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`text-[13px] px-3 py-2 rounded-md mb-0.5 ${
                  item.active
                    ? "bg-dreamBlue/10 text-dreamBlue font-medium"
                    : "text-white/40"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-5">
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Active Conversations", value: "2,847", change: "+12%" },
                { label: "Avg Response Time", value: "1.2s", change: "-34%" },
                { label: "AI Resolution Rate", value: "87%", change: "+8%" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]"
                >
                  <p className="text-[11px] text-white/40 mb-1">{metric.label}</p>
                  <p className="text-xl font-semibold text-white">{metric.value}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">{metric.change}</p>
                </div>
              ))}
            </div>

            {/* Mini chart area */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 h-[140px] flex items-end gap-1">
              {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95, 78, 88, 92, 86, 94, 89, 97, 91].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-dreamBlue/60 to-dreamBlue/20"
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
