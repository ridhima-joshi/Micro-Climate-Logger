import type { SensorReading } from "@/hooks/useSensorData";

interface Props {
  data: SensorReading[];
}

const DataTable = ({ data }: Props) => (
  <div className="chart-container">
    <h3 className="text-sm font-medium text-foreground mb-3">Recent Readings</h3>
    <div className="overflow-auto max-h-[280px]">
      <table className="w-full text-xs font-mono">
        <thead className="sticky top-0 bg-card">
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-2 px-2">Time</th>
            <th className="text-left py-2 px-2">Node</th>
            <th className="text-right py-2 px-2">Temp</th>
            <th className="text-right py-2 px-2">Humidity</th>
            <th className="text-right py-2 px-2">Light</th>
            <th className="text-center py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((r, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
              <td className="py-1.5 px-2 text-muted-foreground">
                {new Date(r.timestamp).toLocaleTimeString("en-US", { hour12: false })}
              </td>
              <td className="py-1.5 px-2 text-foreground">Node {r.node_id}</td>
              <td className="py-1.5 px-2 text-right text-temp-warm">{r.temperature}°C</td>
              <td className="py-1.5 px-2 text-right text-sensor-humidity">{r.humidity}%</td>
              <td className="py-1.5 px-2 text-right text-sensor-light">{r.light} lux</td>
              <td className="py-1.5 px-2 text-center">
                <span className={r.online ? "status-dot-online inline-block" : "status-dot-offline inline-block"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
