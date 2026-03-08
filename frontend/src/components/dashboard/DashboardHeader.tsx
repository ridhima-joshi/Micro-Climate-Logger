import { Activity } from "lucide-react";

const DashboardHeader = () => (
  <header className="dashboard-header px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Micro-Climate Monitoring</h1>
          <p className="text-xs text-muted-foreground">Real-time environmental gradient visualization</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="status-dot-online animate-pulse-glow" />
        <span className="text-xs text-muted-foreground font-mono">LIVE</span>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
