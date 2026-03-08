import type { SensorReading } from "@/hooks/useSensorData";

interface Props {
  nodes: SensorReading[];
  labels: string[];
}

function tempToColor(temp: number, min: number, max: number): string {
  const range = max - min || 1;
  const ratio = (temp - min) / range;
  // Blue -> Cyan -> Green -> Yellow -> Orange -> Red
  const hue = (1 - ratio) * 220;
  return `hsl(${hue}, 85%, 50%)`;
}

const HeatmapGradient = ({ nodes, labels }: Props) => {
  const temps = nodes.map((n) => n.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-3">Micro-Climate Gradient Heatmap</h3>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {nodes.map((n, i) => {
          const bg = tempToColor(n.temperature, min, max);
          return (
            <div
              key={n.node_id}
              className="heatmap-cell text-center"
              style={{ backgroundColor: bg, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              <span className="text-[10px] font-medium opacity-90">{labels[i]}</span>
              <span className="text-lg font-mono font-semibold">{n.temperature}°C</span>
              <span className="text-[10px] opacity-80">Node {n.node_id}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(220, 85%, 50%)" }} /> Cooler
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(0, 85%, 50%)" }} /> Warmer
        </span>
      </div>
    </div>
  );
};

export default HeatmapGradient;
