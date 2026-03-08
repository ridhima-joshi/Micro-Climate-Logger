import type { SensorReading } from "@/hooks/useSensorData";

interface Props {
  nodes: SensorReading[];
  labels: string[];
}

function tempToColor(temp: number, min: number, max: number): string {
  const ratio = (temp - min) / ((max - min) || 1);
  const hue = (1 - ratio) * 220;
  return `hsl(${hue}, 85%, 50%)`;
}

const SpatialLayout = ({ nodes, labels }: Props) => {
  const temps = nodes.map((n) => n.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-3">Spatial Layout — Shelf View</h3>
      <div className="space-y-1.5">
        {nodes.map((n, i) => (
          <div key={n.node_id} className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground w-20 text-right">{labels[i]}</span>
            <div
              className="flex-1 rounded-md py-2 px-3 flex items-center justify-between"
              style={{ backgroundColor: tempToColor(n.temperature, min, max) + "33", borderLeft: `3px solid ${tempToColor(n.temperature, min, max)}` }}
            >
              <span className="text-xs font-mono text-foreground">Node {n.node_id}</span>
              <div className="flex gap-4 text-xs font-mono">
                <span>{n.temperature}°C</span>
                <span className="text-muted-foreground">{n.humidity}%</span>
                <span className="text-muted-foreground">{n.light} lux</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpatialLayout;
