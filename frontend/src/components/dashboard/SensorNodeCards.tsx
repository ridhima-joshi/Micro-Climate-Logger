import { Thermometer, Droplets, Sun } from "lucide-react";
import type { SensorReading } from "@/hooks/useSensorData";

interface Props {
  nodes: SensorReading[];
  labels: string[];
}

const SensorNodeCards = ({ nodes, labels }: Props) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    {nodes.map((n, i) => (
      <div key={n.node_id} className="metric-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Node {n.node_id}</span>
          <div className="flex items-center gap-1.5">
            <span className={n.online ? "status-dot-online" : "status-dot-offline"} />
            <span className={`text-[10px] font-mono uppercase ${n.online ? "status-online" : "status-offline"}`}>
              {n.online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">{labels[i]}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="w-3.5 h-3.5 text-temp-warm" />
            <span className="font-mono text-foreground">{n.temperature}°C</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-3.5 h-3.5 text-sensor-humidity" />
            <span className="font-mono text-foreground">{n.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sun className="w-3.5 h-3.5 text-sensor-light" />
            <span className="font-mono text-foreground">{n.light} lux</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default SensorNodeCards;
